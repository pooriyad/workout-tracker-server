import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'src/common/abstract.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MeasurementUnitEnum } from '../enum/measurement-unit.enum';

@Entity()
export class Weight extends AbstractEntity {
  @Column('date')
  measurementDate: string;

  @Column('double precision')
  weight: string;

  @Column({ default: 'kg', select: false })
  measurementUnit: MeasurementUnitEnum;

  @ManyToOne(() => User, {
    nullable: false,
  })
  user: User['id'];
}
