import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignFeedback } from './entities/campaign-feedback.entity';
import { CreateCampaignFeedbackInput } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums';
import type { JwtPayload } from '../auth/auth.service';

@Resolver(() => CampaignFeedback)
export class CampaignFeedbackResolver {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Mutation(() => CampaignFeedback)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async createCampaignFeedback(
    @Args('createCampaignFeedbackInput') createFeedbackInput: CreateCampaignFeedbackInput,
    @GetCurrentUser() user: JwtPayload,
  ): Promise<CampaignFeedback> {
    return this.campaignsService.createCampaignFeedback(createFeedbackInput, user.userId);
  }

  @Query(() => [CampaignFeedback], { name: 'campaignFeedback' })
  async findCampaignFeedback(@Args('campaignId') campaignId: string): Promise<CampaignFeedback[]> {
    return this.campaignsService.findCampaignFeedback(campaignId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async removeCampaignFeedback(
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.campaignsService.removeCampaignFeedback(id);
  }
}
