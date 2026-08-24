import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Role } from "./Role";

@Entity("users")
export class User {
  @PrimaryColumn("uuid")
  uuid!: string;

  @Column({ type: "varchar", length: 255 })
  fullName!: string;

  @Column({ type: "varchar", length: 64 })
  phone!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  @ManyToOne(() => Role, { eager: true, nullable: false })
  @JoinColumn({ name: "roleId" })
  role!: Role;

  @Column({ type: "varchar", length: 255, nullable: true })
  teamName!: string | null;
}
