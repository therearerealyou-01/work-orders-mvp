import amqplib, { type Channel } from "amqplib";
import { env } from "../config/env";
import type { PublicOrder } from "../lib/serialize";

export const ORDER_EXCHANGE = "work_orders";
export const ORDER_QUEUE = "work_order_events";

export type OrderEventType =
  | "order.created"
  | "order.updated"
  | "order.assigned"
  | "order.status_changed";

export type OrderEvent = {
  type: OrderEventType;
  order: PublicOrder;
  previousAssigneeId: string | null;
  at: string;
};

const ROUTING_KEYS: OrderEventType[] = [
  "order.created",
  "order.updated",
  "order.assigned",
  "order.status_changed",
];

type AmqpConnection = Awaited<ReturnType<typeof amqplib.connect>>;

let connection: AmqpConnection | null = null;
let publishChannel: Channel | null = null;
let ready = false;
let eventHandler: ((event: OrderEvent) => void) | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export function isRabbitReady(): boolean {
  return ready;
}

export function publishOrderEvent(
  type: OrderEventType,
  order: PublicOrder,
  previousAssigneeId: string | null = null,
): void {
  if (!publishChannel || !ready) {
    console.warn("[rabbit] not connected, skip publish", type);
    return;
  }

  const event: OrderEvent = {
    type,
    order,
    previousAssigneeId,
    at: new Date().toISOString(),
  };

  publishChannel.publish(
    ORDER_EXCHANGE,
    type,
    Buffer.from(JSON.stringify(event)),
    { persistent: true, contentType: "application/json" },
  );

  console.log("[rabbit] published", type, order.uuid);
}

async function setup(onEvent: (event: OrderEvent) => void): Promise<void> {
  const conn = await amqplib.connect(env.RABBITMQ_URL);
  connection = conn;

  const pub = await conn.createChannel();
  await pub.assertExchange(ORDER_EXCHANGE, "topic", { durable: true });
  await pub.assertQueue(ORDER_QUEUE, { durable: true });
  for (const key of ROUTING_KEYS) {
    await pub.bindQueue(ORDER_QUEUE, ORDER_EXCHANGE, key);
  }
  publishChannel = pub;

  const consumeCh = await conn.createChannel();
  await consumeCh.prefetch(10);
  await consumeCh.consume(ORDER_QUEUE, (msg) => {
    if (!msg) return;
    try {
      const event = JSON.parse(msg.content.toString()) as OrderEvent;
      console.log("[rabbit] consumed", event.type, event.order?.uuid);
      onEvent(event);
      consumeCh.ack(msg);
    } catch (err) {
      console.error("[rabbit] consume error", err);
      consumeCh.nack(msg, false, false);
    }
  });

  conn.on("close", () => {
    console.warn("[rabbit] connection closed");
    ready = false;
    publishChannel = null;
    connection = null;
    scheduleReconnect();
  });

  conn.on("error", (err) => {
    console.error("[rabbit] connection error", err);
  });

  ready = true;
  console.log(
    "[rabbit] connected, exchange=%s queue=%s",
    ORDER_EXCHANGE,
    ORDER_QUEUE,
  );
}

function scheduleReconnect(): void {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (eventHandler) {
      void startRabbit(eventHandler);
    }
  }, 3000);
}

export async function startRabbit(
  onEvent: (event: OrderEvent) => void,
): Promise<void> {
  eventHandler = onEvent;
  try {
    await setup(onEvent);
  } catch (err) {
    console.error("[rabbit] connect failed, retry in 3s", err);
    ready = false;
    scheduleReconnect();
  }
}

export async function stopRabbit(): Promise<void> {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  ready = false;
  try {
    await publishChannel?.close();
  } catch {
    /* ignore */
  }
  try {
    await connection?.close();
  } catch {
    /* ignore */
  }
  publishChannel = null;
  connection = null;
}
