import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstratEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}
