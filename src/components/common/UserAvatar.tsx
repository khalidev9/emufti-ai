import React from 'react';
import { CircularPlanAvatar, CircularPlanAvatarProps } from './CircularPlanAvatar';

export interface UserAvatarProps extends CircularPlanAvatarProps {}

/**
 * UserAvatar: Canonical profile avatar component for EMufti AI.
 * Backed by CircularPlanAvatar with SVG gradient borders
 * (Gold for Premium, Green for Pro, neutral for Free).
 */
export const UserAvatar: React.FC<UserAvatarProps> = (props) => {
  return <CircularPlanAvatar {...props} />;
};

export { CircularPlanAvatar };
export type { CircularPlanAvatarProps };
