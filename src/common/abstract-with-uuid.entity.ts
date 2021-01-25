import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntityWithUUID {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    select: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    select: false,
  })
  updatedAt: Date;
}
