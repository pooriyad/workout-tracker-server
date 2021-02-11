import { AbstractEntity } from 'src/common/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Profile extends AbstractEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ type: 'integer', nullable: true })
  height: number;
}
