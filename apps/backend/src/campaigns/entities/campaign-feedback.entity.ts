import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from "typeorm";
import { Campaign } from './campaign.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
@ObjectType()
export class CampaignFeedback {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => String, { description: 'ID of the campaign feedback' })
  id: string;

  @Column()
  @Field(() => String, { description: 'Campaign ID' })
  campaignId: string;

  @ManyToOne(() => Campaign)
  @Field(() => Campaign, { description: 'Campaign this feedback belongs to' })
  campaign: Campaign;

  @Column()
  @Field(() => String, { description: 'Moderator ID who gave the feedback' })
  moderatorId: string;

  @ManyToOne(() => User)
  @Field(() => User, { description: 'Moderator who gave the feedback' })
  moderator: User;

  @Column('text')
  @Field(() => String, { description: 'Feedback message' })
  message: string;

  @CreateDateColumn()
  @Field(() => Date, { description: 'Creation date of the feedback' })
  createdAt: Date;
}
