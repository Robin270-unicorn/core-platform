import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignFeedback } from './entities/campaign-feedback.entity';
import { CreateCampaignFeedbackInput } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';

@Resolver(() => CampaignFeedback)
export class CampaignFeedbackResolver {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Mutation(() => CampaignFeedback)
  @UseGuards(JwtAuthGuard)
  async createCampaignFeedback(
    @Args('createCampaignFeedbackInput') createFeedbackInput: CreateCampaignFeedbackInput,
    @GetCurrentUser() user: any,
  ): Promise<CampaignFeedback> {
    return this.campaignsService.createCampaignFeedback(createFeedbackInput, user.id);
  }

  @Query(() => [CampaignFeedback], { name: 'campaignFeedback' })
  async findCampaignFeedback(@Args('campaignId') campaignId: string): Promise<CampaignFeedback[]> {
    return this.campaignsService.findCampaignFeedback(campaignId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeCampaignFeedback(
    @Args('id') id: string,
  ): Promise<boolean> {
    // TODO: Add authorization check to ensure user is moderator or owns the feedback
    return this.campaignsService.removeCampaignFeedback(id);
  }
}
