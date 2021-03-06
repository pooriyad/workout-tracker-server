import { AbstractEntity } from 'src/common/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { MeasurementUnitEnum } from '../enum/measurement-unit.enum';

@Entity()
export class WeightGoal extends AbstractEntity {
  @Column('double precision', { nullable: false })
  weight: string;

  @Column('date', { nullable: false })
  date: string;

  @Column({ default: 'kg', select: false })
  measurementUnit: MeasurementUnitEnum;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn()
  user: User['id'];
}
