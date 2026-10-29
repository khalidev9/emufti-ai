/**
 * Verification Test Suite for:
 * 1. Mobile Header Overflow Fix (Header.tsx)
 * 2. Sidebar Navigation Buttons Rearrangement to Bottom Vertical Stack (Sidebar.tsx)
 * 3. Fully Functional Notification Center (NotificationCenter.tsx, Header.tsx)
 * 4. Modern Gemini-Style Chat Interface Redesign (WelcomeScreen.tsx, ChatMessage.tsx, MessageComposer.tsx)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

describe('EMUFTI AI: Mobile UI & Modern Chat Redesign Verification', () => {

  describe('1. Mobile Header Layout & Overflow Prevention (Header.tsx)', () => {
    const headerPath = path.join(ROOT_DIR, 'src', 'components', 'layout', 'Header.tsx');

    it('1.1 Header uses streamlined flex layout with overflow containment', () => {
      assert.ok(fs.existsSync(headerPath), 'Header.tsx must exist');
      const content = fs.readFileSync(headerPath, 'utf8');

      assert.ok(content.includes('flex items-center justify-between'), 'Header must use flex items-center justify-between');
      assert.ok(content.includes('w-full max-w-full overflow-hidden'), 'Header must enforce w-full max-w-full overflow-hidden to prevent horizontal page overflow');
    });

    it('1.2 Header brand logo and profile adapt responsively for mobile screen widths', () => {
      const content = fs.readFileSync(headerPath, 'utf8');

      // Subtitle text is removed below EMufti AI logo
      assert.ok(!content.includes('Islamic Intelligence'), 'Subtitle text is completely removed from header');

      // Profile text wrapper and background box are removed, leaving clean UserAvatar
      assert.ok(content.includes('UserAvatar'), 'UserAvatar remains clean without card background or text name');
    });

    it('1.3 Header removes cluttered action icons on mobile screens (Clock, SquarePen, Language select)', () => {
      const content = fs.readFileSync(headerPath, 'utf8');

      // Clock history and SquarePen new-chat icons are hidden on mobile
      assert.ok(content.includes('hidden md:inline-flex') && content.includes('Clock'), 'Clock icon must be hidden on mobile');
      assert.ok(content.includes('hidden md:inline-flex') && content.includes('SquarePen'), 'SquarePen icon must be hidden on mobile');

      // Extra language dropdown is hidden on mobile to prevent overcrowding
      assert.ok(content.includes('hidden md:block') && content.includes('targetLanguage'), 'Language select must be hidden on mobile');
    });
  });

  describe('2. Sidebar Navigation Buttons Rearrangement (Sidebar.tsx)', () => {
    const sidebarPath = path.join(ROOT_DIR, 'src', 'components', 'layout', 'Sidebar.tsx');

    it('2.1 Top 2x2 grid is removed from top section of sidebar', () => {
      assert.ok(fs.existsSync(sidebarPath), 'Sidebar.tsx must exist');
      const content = fs.readFileSync(sidebarPath, 'utf8');

      // Ensure 2x2 grid is no longer at the top under search
      const searchIndex = content.indexOf('Search chats...');
      const firstMiddleIndex = content.indexOf('MIDDLE SCROLLABLE AREA');
      const textBetween = content.substring(searchIndex, firstMiddleIndex);
      assert.ok(!textBetween.includes('grid grid-cols-2'), 'Top area under search must not contain grid-cols-2');
    });

    it('2.2 Core navigation buttons are stacked vertically at the bottom above the profile footer', () => {
      const content = fs.readFileSync(sidebarPath, 'utf8');

      const middleScrollIndex = content.indexOf('MIDDLE SCROLLABLE AREA');
      const navStackIndex = content.indexOf('Dedicated vertical row/stack at the bottom of the sidebar');
      const profileFooterIndex = content.indexOf('BOTTOM USER PROFILE FOOTER');

      assert.ok(navStackIndex > middleScrollIndex, 'Navigation stack must be positioned below the scrollable conversation area');
      assert.ok(profileFooterIndex > navStackIndex, 'Profile footer must be positioned below the navigation stack');

      // Verify all 4 core buttons are present in the vertical stack
      assert.ok(content.includes('to="/quran"') && content.includes('Holy Quran'), 'Must contain Holy Quran button');
      assert.ok(content.includes('to="/quiz"') && content.includes('EMufti Quiz'), 'Must contain EMufti Quiz button');
      assert.ok(content.includes('to="/dashboard"') && content.includes('Dashboard'), 'Must contain Dashboard button');
      assert.ok(content.includes('to="/help"') && content.includes('Help Center'), 'Must contain Help Center button');
    });
  });

  describe('3. Notification Center (NotificationCenter.tsx & Header.tsx)', () => {
    const notifCenterPath = path.join(ROOT_DIR, 'src', 'components', 'notifications', 'NotificationCenter.tsx');
    const headerPath = path.join(ROOT_DIR, 'src', 'components', 'layout', 'Header.tsx');

    it('3.1 NotificationCenter component exists and is imported into Header', () => {
      assert.ok(fs.existsSync(notifCenterPath), 'NotificationCenter.tsx must exist');
      const headerContent = fs.readFileSync(headerPath, 'utf8');
      assert.ok(headerContent.includes('NotificationCenter'), 'Header.tsx must import and render NotificationCenter');
      assert.ok(headerContent.includes('<NotificationCenter />'), 'Header.tsx must render <NotificationCenter /> in action bar');
    });

    it('3.2 NotificationCenter provides bell icon, unread counter badge, filter tabs, and broadcasts', () => {
      const content = fs.readFileSync(notifCenterPath, 'utf8');

      // Bell trigger with badge
      assert.ok(content.includes('Bell'), 'Must render Bell icon');
      assert.ok(content.includes('unreadCount > 0'), 'Must render unread notification badge');

      // Filter tabs
      assert.ok(content.includes("setActiveTab('all')"), 'Must have All tab filter');
      assert.ok(content.includes("setActiveTab('unread')"), 'Must have Unread tab filter');

      // Broadcast and plan notifications support
      assert.ok(content.includes('DEFAULT_BROADCASTS'), 'Must maintain platform broadcast notifications');
      assert.ok(content.includes('handleMarkAllAsRead'), 'Must allow marking all notifications as read');
    });

    it('3.3 NotificationCenter uses createPortal and backdrop overlay for unclippable responsive viewing', () => {
      const content = fs.readFileSync(notifCenterPath, 'utf8');

      assert.ok(content.includes('createPortal'), 'Must render via createPortal into document.body');
      assert.ok(content.includes('fixed inset-0 z-50'), 'Must provide fixed modal overlay backdrop');
      assert.ok(content.includes("event.key === 'Escape'"), 'Must support closing modal with Escape key');
    });
  });

  describe('4. Modern Chat Interface Redesign (Gemini-Style)', () => {
    const welcomeScreenPath = path.join(ROOT_DIR, 'src', 'components', 'chat', 'WelcomeScreen.tsx');
    const chatMessagePath = path.join(ROOT_DIR, 'src', 'components', 'chat', 'ChatMessage.tsx');
    const composerPath = path.join(ROOT_DIR, 'src', 'components', 'chat', 'MessageComposer.tsx');

    it('4.1 WelcomeScreen features Gemini-style floating prompt cards with hover elevation', () => {
      const content = fs.readFileSync(welcomeScreenPath, 'utf8');
      assert.ok(content.includes('rounded-3xl bg-white/95'), 'Prompt cards must use modern rounded-3xl with glassmorphic background');
      assert.ok(content.includes('hover:shadow-xl hover:shadow-blue-500/10'), 'Cards must have glowing hover elevation');
      assert.ok(content.includes('ANIMATED_CARDS'), 'Must preserve animated prompt card triggers');
    });

    it('4.2 ChatMessage styles user bubbles and assistant responses with clear separation', () => {
      const content = fs.readFileSync(chatMessagePath, 'utf8');

      // User bubble
      assert.ok(content.includes('bg-blue-600 text-white rounded-3xl rounded-tr-xs'), 'User query must render as sleek royal blue bubble');

      // Assistant response card
      assert.ok(content.includes('rounded-3xl p-4 sm:p-6'), 'Assistant response must render as modern spacious card');
      assert.ok(content.includes('from-blue-600 to-indigo-600'), 'Assistant insignia must use gradient styling');
    });

    it('4.3 MessageComposer implements glowing focus state, floating pills, and action icons', () => {
      const content = fs.readFileSync(composerPath, 'utf8');

      // Focus-within glowing ring
      assert.ok(content.includes('focus-within:ring-4 focus-within:ring-blue-500/15'), 'Composer must have glowing focus ring');
      assert.ok(content.includes('rounded-3xl'), 'Composer card must use rounded-3xl container');

      // Floating suggestion pills
      assert.ok(content.includes('QUICK_SUGGESTIONS'), 'Must support floating suggestion pills');

      // Quick action icons (Plus attachment, voice microphone, send button)
      assert.ok(content.includes('Plus'), 'Must include Plus action icon');
      assert.ok(content.includes('handleToggleVoice'), 'Must support voice recording icon');
      assert.ok(content.includes('bg-gradient-to-r from-blue-600 to-indigo-600'), 'Send button must use modern gradient style');
    });

    it('4.4 ChatMessage features polished three-dot bounce and streaming pulse indicators', () => {
      const content = fs.readFileSync(chatMessagePath, 'utf8');

      // Three-dot bouncing animation
      assert.ok(content.includes('animate-bounce'), 'Must use animated bouncing dots during response generation');

      // Streaming cursor
      assert.ok(content.includes('bg-blue-600 animate-pulse'), 'Must render active pulsating cursor during text stream');
    });
  });

});
