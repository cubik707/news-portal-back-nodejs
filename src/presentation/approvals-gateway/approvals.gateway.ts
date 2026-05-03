import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/approvals' })
@Injectable()
export class ApprovalsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.id;
      client.join(payload.id); // room = user ID
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket): void {
    // rooms are cleaned up automatically by socket.io
  }

  emitApprovalNew(
    targetAdminIds: string[],
    payload: { approvalId: string; newsId: string; newsTitle: string; editorName: string },
  ): void {
    for (const adminId of targetAdminIds) {
      this.server.to(adminId).emit('approval:new', payload);
    }
  }

  emitApprovalDecided(
    editorId: string,
    payload: { approvalId: string; newsId: string; status: string; comment: string | null },
  ): void {
    this.server.to(editorId).emit('approval:decided', payload);
  }

  emitUserRegistered(targetAdminIds: string[]): void {
    for (const adminId of targetAdminIds) {
      this.server.to(adminId).emit('user:registered', {});
    }
  }
}
