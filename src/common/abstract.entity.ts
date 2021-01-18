import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    select: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    select: false,
  })
  updatedAt: Date;
}
