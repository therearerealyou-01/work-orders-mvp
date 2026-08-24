import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type RoleCode = "operator" | "team";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 32, unique: true })
  code!: RoleCode;
}
