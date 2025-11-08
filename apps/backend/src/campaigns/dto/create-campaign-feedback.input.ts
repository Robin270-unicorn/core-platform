import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCampaignFeedbackInput {
  @Field(() => String)
  campaignId: string;

  @Field(() => String)
  message: string;
}
