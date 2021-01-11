import { Exclude } from 'class-transformer';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { AbstratEntityWithUUID } from 'src/common/abstract-with-uuid.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class User extends AbstratEntityWithUUID {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  @Exclude()
  refreshToken: string;

  @Column({ default: false })
  @Exclude()
  isEmailConfirmed: boolean;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }
}
