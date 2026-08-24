import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

export type WorkOrderStatus = "new" | "in_progress" | "done";

@Entity("work_orders")
export class WorkOrder {
  @PrimaryColumn("uuid")
  uuid!: string;

  @Column({ type: "uuid", nullable: true })
  assigneeId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "assigneeId" })
  assignee!: User | null;

  @Column({ type: "timestamptz" })
  scheduledAt!: Date;

  @Column({ type: "varchar", length: 500 })
  address!: string;

  @Column({ type: "varchar", length: 32 })
  status!: WorkOrderStatus;

  @Column({ type: "text" })
  description!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @Column({ type: "uuid" })
  createdBy!: string;
}
