import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Campaign, CampaignStatus} from './entities/campaign.entity';
import {CampaignFeedback} from './entities/campaign-feedback.entity';
import {CampaignStats} from './entities/campaign-stats.entity';
import {CreateCampaignFeedbackInput, CreateCampaignInput, UpdateCampaignInput, UpdateCampaignStatsInput} from './dto';

@Injectable()
export class CampaignsService {
  constructor(
    @Inject('CAMPAIGN_REPOSITORY')
    private campaignRepository: Repository<Campaign>,
    @Inject('CAMPAIGN_FEEDBACK_REPOSITORY')
    private campaignFeedbackRepository: Repository<CampaignFeedback>,
    @Inject('CAMPAIGN_STATS_REPOSITORY')
    private campaignStatsRepository: Repository<CampaignStats>,
  ) {}

  async createCampaign(createCampaignInput: CreateCampaignInput, creatorId: string): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      ...createCampaignInput,
      creatorId,
    });

    const savedCampaign = await this.campaignRepository.save(campaign);

    await this.createCampaignStats(savedCampaign.id);

    return savedCampaign;
  }

  async findAllCampaigns(): Promise<Campaign[]> {
    return this.campaignRepository.find({
      relations: ['creator'],
      where: {
        status: CampaignStatus.APPROVED
      }
    });
  }

  async findCampaignById(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async updateCampaign(id: string, updateCampaignInput: UpdateCampaignInput): Promise<Campaign> {
    await this.campaignRepository.update(id, updateCampaignInput);
    return this.findCampaignById(id);
  }

  async removeCampaign(id: string): Promise<boolean> {
    await this.campaignRepository.delete(id);
    return true;
  }

  async findCampaignsByCreator(creatorId: string): Promise<Campaign[]> {
    return this.campaignRepository.find({
      where: { creatorId },
      relations: ['creator'],
    });
  }

  async createCampaignFeedback(createFeedbackInput: CreateCampaignFeedbackInput, moderatorId: string): Promise<CampaignFeedback> {
    const feedback = this.campaignFeedbackRepository.create({
      ...createFeedbackInput,
      moderatorId,
    });

    return this.campaignFeedbackRepository.save(feedback);
  }

  async findCampaignFeedback(campaignId: string): Promise<CampaignFeedback[]> {
    return this.campaignFeedbackRepository.find({
      where: { campaignId },
      relations: ['campaign', 'moderator'],
      order: { createdAt: 'DESC' },
    });
  }

  async removeCampaignFeedback(id: string): Promise<boolean> {
    await this.campaignFeedbackRepository.delete(id);
    return true;
  }

  async createCampaignStats(campaignId: string): Promise<CampaignStats> {
    const stats = this.campaignStatsRepository.create({
      campaignId,
      viewsCount: 0,
      contributionsCount: 0,
      totalFunding: 0,
    });

    return this.campaignStatsRepository.save(stats);
  }

  async findCampaignStats(campaignId: string): Promise<CampaignStats> {
    const stats = await this.campaignStatsRepository.findOne({
      where: { campaignId },
      relations: ['campaign'],
    });

    if (!stats) {
      throw new NotFoundException(`Campaign stats for campaign ${campaignId} not found`);
    }

    return stats;
  }

  async updateCampaignStats(updateStatsInput: UpdateCampaignStatsInput): Promise<CampaignStats> {
    const { campaignId, ...updateData } = updateStatsInput;

    await this.campaignStatsRepository.update({ campaignId }, updateData);
    return this.findCampaignStats(campaignId);
  }

  async incrementCampaignViews(campaignId: string): Promise<CampaignStats> {
    await this.campaignStatsRepository.increment({ campaignId }, 'viewsCount', 1);
    return this.findCampaignStats(campaignId);
  }

  async incrementCampaignContributions(campaignId: string, amount: number): Promise<CampaignStats> {
    await this.campaignStatsRepository.increment({ campaignId }, 'contributionsCount', 1);
    await this.campaignStatsRepository.increment({ campaignId }, 'totalFunding', amount);

    await this.campaignRepository.increment({ id: campaignId }, 'currentAmount', amount);

    return this.findCampaignStats(campaignId);
  }
}
