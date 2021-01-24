import { Exclude } from 'class-transformer';
import { isBefore, isToday, parseISO } from 'date-fns';
import { AbstractEntity } from 'src/common/abstract.entity';
import { User } from 'src/modules/users/user.entity';
import { AfterLoad, Column, Entity, ManyToOne } from 'typeorm';
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

  @AfterLoad()
  updateStatus() {
    const parsedDate = parseISO(this.date);
    if (
      this.status === 'todo' &&
      isBefore(parsedDate, new Date()) &&
      !isToday(parsedDate)
    ) {
      this.status = ScheduleStatusEnum.INDETERMINATE;
    }
  }
}
