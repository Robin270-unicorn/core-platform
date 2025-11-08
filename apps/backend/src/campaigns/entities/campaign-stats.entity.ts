import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Campaign } from './campaign.entity';

@Entity()
@ObjectType()
export class CampaignStats {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => String, { description: 'ID of the campaign stats' })
  id: string;

  @Column()
  @Field(() => String, { description: 'Campaign ID' })
  campaignId: string;

  @OneToOne(() => Campaign)
  @JoinColumn()
  @Field(() => Campaign, { description: 'Campaign these stats belong to' })
  campaign: Campaign;

  @Column({ default: 0 })
  @Field(() => Number, { description: 'Number of views for the campaign' })
  viewsCount: number;

  @Column({ default: 0 })
  @Field(() => Number, { description: 'Number of contributions to the campaign' })
  contributionsCount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @Field(() => Number, { description: 'Total funding received by the campaign' })
  totalFunding: number;

  @UpdateDateColumn()
  @Field(() => Date, { description: 'Last update date of the stats' })
  lastUpdate: Date;
}
