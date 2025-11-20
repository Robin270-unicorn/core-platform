import { Injectable, Optional, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateNotificationInput, UpdateNotificationInput, NotificationCount } from './dto';
import { Notification, NotificationType } from './entities';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsClient {
    constructor(
        @Optional() @Inject('NOTIFICATIONS_SERVICE')
        private readonly client: ClientProxy | null,
        private readonly notificationsService: NotificationsService,
    ) {}

    private get useMicroservice(): boolean {
        return this.client !== null && this.client !== undefined;
    }

    async getUserNotifications(userId: string): Promise<Notification[]> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.get_user_notifications', { userId }));
        }
        return this.notificationsService.getNotificationsByUserId(userId);
    }

    async getUnreadNotifications(userId: string): Promise<Notification[]> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.get_unread_notifications', { userId }));
        }
        return this.notificationsService.getUnreadNotificationsByUserId(userId);
    }

    async getNotificationCount(userId: string): Promise<NotificationCount> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.get_notification_count', { userId }));
        }
        return this.notificationsService.getNotificationCount(userId);
    }

    async createNotification(input: CreateNotificationInput): Promise<Notification> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.create', input));
        }
        return this.notificationsService.createNotification(input);
    }

    async createNotificationForUser(userId: string, input: Omit<CreateNotificationInput, 'userId'>): Promise<Notification> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.create_for_user', { userId, input }));
        }
        return this.notificationsService.createNotification({ ...input, userId } as CreateNotificationInput);
    }

    async markAsRead(notificationId: string, userId: string): Promise<Notification> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.mark_as_read', { notificationId, userId }));
        }
        return this.notificationsService.markAsRead(notificationId);
    }

    async updateNotification(id: string, input: UpdateNotificationInput): Promise<Notification> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.update', { id, input }));
        }
        return this.notificationsService.updateNotification(id, input);
    }

    async deleteNotification(id: string): Promise<{ message: string; success: boolean }> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.delete', { id }));
        }
        await this.notificationsService.deleteNotification(id);
        return { message: 'Notification deleted', success: true };
    }

    // Pomocné metody pro různé typy notifikací
    async createInfoNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<Notification> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.create_info', { userId, title, message, actionUrl }));
        }
        return this.notificationsService.createNotification({
            userId,
            title,
            message,
            type: NotificationType.INFO,
            actionUrl,
        });
    }

    async createSuccessNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<Notification> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.create_success', { userId, title, message, actionUrl }));
        }
        return this.notificationsService.createNotification({
            userId,
            title,
            message,
            type: NotificationType.SUCCESS,
            actionUrl,
        });
    }

    async createWarningNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<Notification> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.create_warning', { userId, title, message, actionUrl }));
        }
        return this.notificationsService.createNotification({
            userId,
            title,
            message,
            type: NotificationType.WARNING,
            actionUrl,
        });
    }

    async createErrorNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<Notification> {
        if (this.useMicroservice) {
            return firstValueFrom(this.client!.send('notifications.create_error', { userId, title, message, actionUrl }));
        }
        return this.notificationsService.createNotification({
            userId,
            title,
            message,
            type: NotificationType.ERROR,
            actionUrl,
        });
    }
}
