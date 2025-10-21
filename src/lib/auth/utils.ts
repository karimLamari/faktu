import { getServerSession } from 'next-auth/next';
import { authOptions } from './config';

export async function getAuthSession() {
  return await getServerSession(authOptions);
}

export { authOptions };