import { AbstractEntity } from 'src/common/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Profile extends AbstractEntity {
  @Column()
  name: string;

  @Column({ type: 'integer' })
  height: number;
}
