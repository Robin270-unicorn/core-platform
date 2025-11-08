import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateCampaignStatsInput {
  @Field(() => String)
  campaignId: string;

  @Field(() => Number, { nullable: true })
  viewsCount?: number;

  @Field(() => Number, { nullable: true })
  contributionsCount?: number;

  @Field(() => Number, { nullable: true })
  totalFunding?: number;
}
