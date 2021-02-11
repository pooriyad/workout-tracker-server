import { Exclude } from 'class-transformer';
import { isBefore, isToday } from 'date-fns';
import { AbstractEntity } from 'src/common/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { AfterLoad, Column, Entity, ManyToOne } from 'typeorm';
import { ScheduleStatusEnum } from '../enum/schedule-status.enum';

@Entity()
export class Schedule extends AbstractEntity {
  @Column({ type: 'date' })
  date: Date;

  @Column()
  status: ScheduleStatusEnum;

  @ManyToOne(() => User)
  @Exclude()
  user: User['id'];

  @AfterLoad()
  updateStatus() {
    const date = new Date(this.date);
    if (
      this.status === 'todo' &&
      isBefore(date, new Date()) &&
      !isToday(date)
    ) {
      this.status = ScheduleStatusEnum.INDETERMINATE;
    }
  }
}
