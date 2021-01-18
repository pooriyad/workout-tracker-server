import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'src/common/abstract.entity';
import { User } from 'src/modules/users/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ScheduleStatusEnum } from '../enum/schedule-status.enum';

@Entity()
export class Schedule extends AbstractEntity {
  @Column({ type: 'date' })
  date: string;

  @Column()
  status: ScheduleStatusEnum;

  @ManyToOne(() => User)
  @Exclude()
  user: User['id'];
}
