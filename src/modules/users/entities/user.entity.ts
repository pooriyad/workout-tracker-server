import { Exclude } from 'class-transformer';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { AbstractEntityWithUUID } from 'src/common/abstract-with-uuid.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class User extends AbstractEntityWithUUID {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @Column({ default: false, select: false })
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
