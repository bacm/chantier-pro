export interface Decision {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'photo' | 'document';
  url?: string;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  client: string;
  createdAt: Date;
  decisions: Decision[];
}
