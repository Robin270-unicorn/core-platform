import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignInput, UpdateCampaignInput } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';

@Resolver(() => Campaign)
export class CampaignsResolver {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Mutation(() => Campaign)
  @UseGuards(JwtAuthGuard)
  async createCampaign(
    @Args('createCampaignInput') createCampaignInput: CreateCampaignInput,
    @GetCurrentUser() user: any,
  ): Promise<Campaign> {
    return this.campaignsService.createCampaign(createCampaignInput, user.id);
  }

  @Query(() => [Campaign], { name: 'campaigns' })
  async findAllCampaigns(): Promise<Campaign[]> {
    return this.campaignsService.findAllCampaigns();
  }

  @Query(() => Campaign, { name: 'campaign' })
  async findCampaignById(@Args('id') id: string): Promise<Campaign> {
    return this.campaignsService.findCampaignById(id);
  }

  @Query(() => [Campaign], { name: 'myCampaigns' })
  @UseGuards(JwtAuthGuard)
  async findMyCampaigns(
    @GetCurrentUser() user: any,
  ): Promise<Campaign[]> {
    return this.campaignsService.findCampaignsByCreator(user.id);
  }

  @Mutation(() => Campaign)
  @UseGuards(JwtAuthGuard)
  async updateCampaign(
    @Args('updateCampaignInput') updateCampaignInput: UpdateCampaignInput,
  ): Promise<Campaign> {
    // TODO: Add authorization check to ensure user owns the campaign
    return this.campaignsService.updateCampaign(updateCampaignInput.id, updateCampaignInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeCampaign(
    @Args('id') id: string,
  ): Promise<boolean> {
    // TODO: Add authorization check to ensure user owns the campaign
    return this.campaignsService.removeCampaign(id);
  }

  @Mutation(() => Campaign)
  async incrementCampaignViews(@Args('campaignId') campaignId: string): Promise<Campaign> {
    await this.campaignsService.incrementCampaignViews(campaignId);
    return this.campaignsService.findCampaignById(campaignId);
  }
}
