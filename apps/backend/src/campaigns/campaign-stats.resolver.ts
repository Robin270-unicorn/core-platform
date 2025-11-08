import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignStats } from './entities/campaign-stats.entity';
import { UpdateCampaignStatsInput } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => CampaignStats)
export class CampaignStatsResolver {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Query(() => CampaignStats, { name: 'campaignStats' })
  async findCampaignStats(@Args('campaignId') campaignId: string): Promise<CampaignStats> {
    return this.campaignsService.findCampaignStats(campaignId);
  }

  @Mutation(() => CampaignStats)
  @UseGuards(JwtAuthGuard)
  async updateCampaignStats(
    @Args('updateCampaignStatsInput') updateStatsInput: UpdateCampaignStatsInput,
  ): Promise<CampaignStats> {
    return this.campaignsService.updateCampaignStats(updateStatsInput);
  }

  @Mutation(() => CampaignStats)
  async incrementCampaignContributions(
    @Args('campaignId') campaignId: string,
    @Args('amount') amount: number,
  ): Promise<CampaignStats> {
    return this.campaignsService.incrementCampaignContributions(campaignId, amount);
  }
}
