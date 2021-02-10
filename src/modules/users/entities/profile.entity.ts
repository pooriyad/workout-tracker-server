import { AbstractEntity } from 'src/common/abstract.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile extends AbstractEntity {
  @PrimaryGeneratedColumn()
  @Column({ nullable: true })
  name: string;

  @Column({ type: 'integer', nullable: true })
  height: number;
}
