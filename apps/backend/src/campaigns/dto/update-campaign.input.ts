import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCampaignInput } from './create-campaign.input';

@InputType()
export class UpdateCampaignInput extends PartialType(CreateCampaignInput) {
  @Field(() => String)
  id: string;

  @Field(() => Number, { nullable: true })
  currentAmount?: number;
}
