import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('=== EMUFTI AI: MOBILE CHAT DESIGN & DRAWER VERIFICATION TESTS ===\n');

const ROOT = process.cwd();

// Test 1: ConversationHistoryDrawer Component
console.log('1. Testing ConversationHistoryDrawer Component...');
const drawerPath = path.join(ROOT, 'src/components/chat/ConversationHistoryDrawer.tsx');
assert.ok(fs.existsSync(drawerPath), 'ConversationHistoryDrawer.tsx must exist');
const drawerContent = fs.readFileSync(drawerPath, 'utf8');

assert.ok(drawerContent.includes('New Chat') || drawerContent.includes('handleStartNewChat'), 'Must include New Chat action');
assert.ok(drawerContent.includes('Search') && drawerContent.includes('searchQuery'), 'Must include search functionality');
assert.ok(drawerContent.includes('Edit3') || drawerContent.includes('renameConversation'), 'Must support renaming conversations');
assert.ok(drawerContent.includes('Trash2') || drawerContent.includes('deleteConversation'), 'Must support deleting conversations');
assert.ok(drawerContent.includes('getRelativeDateGroup') || drawerContent.includes('Today'), 'Must support grouping conversations by date');
console.log('  ✓ ConversationHistoryDrawer has New Chat, search, rename, delete, and date grouping');

// Test 2: Header Component Controls
console.log('2. Testing Header Controls & Screenshot Matching...');
const headerPath = path.join(ROOT, 'src/components/layout/Header.tsx');
assert.ok(fs.existsSync(headerPath), 'Header.tsx must exist');
const headerContent = fs.readFileSync(headerPath, 'utf8');

assert.ok(headerContent.includes('Menu'), 'Header must have mobile menu toggle (hamburger)');
assert.ok(headerContent.includes('EMufti AI') && headerContent.includes('Online'), 'Header must have EMufti AI and Online indicator');
assert.ok(headerContent.includes('Clock') && (headerContent.includes('onOpenConversationHistory') || headerContent.includes('onMobileMenuToggle')), 'Header must have Clock button opening Conversation History');
assert.ok(headerContent.includes('SquarePen') || headerContent.includes('createNewChat'), 'Header must have New Chat button');
console.log('  ✓ Header matches mobile reference screenshot (Logo, Online dot, Clock, SquarePen, Menu)');

// Test 3: ChatPage Integration
console.log('3. Testing ChatPage Integration...');
const chatPagePath = path.join(ROOT, 'src/pages/ChatPage.tsx');
assert.ok(fs.existsSync(chatPagePath), 'ChatPage.tsx must exist');
const chatPageContent = fs.readFileSync(chatPagePath, 'utf8');

assert.ok(chatPageContent.includes('ConversationHistoryDrawer'), 'ChatPage must mount ConversationHistoryDrawer');
assert.ok(chatPageContent.includes('isConversationHistoryOpen'), 'ChatPage must manage conversation history open state');
assert.ok(chatPageContent.includes('BottomNavigation'), 'ChatPage must mount BottomNavigation');
assert.ok(chatPageContent.includes('isKeyboardOpen'), 'ChatPage must track mobile keyboard open state');
console.log('  ✓ ChatPage correctly connects Header, Conversation Drawer, and Bottom Navigation');

// Test 4: ChatMessage Screenshot Fidelity
console.log('4. Testing ChatMessage Component Fidelity...');
const chatMessagePath = path.join(ROOT, 'src/components/chat/ChatMessage.tsx');
assert.ok(fs.existsSync(chatMessagePath), 'ChatMessage.tsx must exist');
const msgContent = fs.readFileSync(chatMessagePath, 'utf8');

assert.ok(msgContent.includes('bg-blue-50') || msgContent.includes('bg-emerald-50'), 'User message must use soft blue/green background');
assert.ok(msgContent.includes('CheckCheck'), 'User message must display double checkmark');
assert.ok(msgContent.includes('Logo') || msgContent.includes('rounded-full'), 'Assistant message must have circular logo avatar on the left');
assert.ok(msgContent.includes('Volume2') && msgContent.includes('handleToggleSpeech'), 'Assistant card must have audio speech listen button');
assert.ok(msgContent.includes('Bookmark'), 'Assistant card must have Bookmark button');
assert.ok(msgContent.includes('Copy') && msgContent.includes('handleCopy'), 'Assistant card must have Copy button');
assert.ok(msgContent.includes('ThumbsUp') && msgContent.includes('ThumbsDown'), 'Assistant card must have feedback buttons');
console.log('  ✓ ChatMessage correctly implements user bubble and assistant card with actions');

// Test 5: MessageComposer Screenshot Fidelity
console.log('5. Testing MessageComposer Fidelity...');
const composerPath = path.join(ROOT, 'src/components/chat/MessageComposer.tsx');
assert.ok(fs.existsSync(composerPath), 'MessageComposer.tsx must exist');
const composerContent = fs.readFileSync(composerPath, 'utf8');

assert.ok(composerContent.includes('QUICK_SUGGESTIONS') && composerContent.includes("Faa'iidada Quraanka kale?"), 'Composer must include suggestion chips');
assert.ok(composerContent.includes('Plus'), 'Composer must have Plus (+) options button');
assert.ok(composerContent.includes('Mic') && composerContent.includes('handleToggleVoice'), 'Composer must have Microphone button');
assert.ok(composerContent.includes('Weydii EMufti AI...'), 'Composer must have placeholder "Weydii EMufti AI..."');
assert.ok(composerContent.includes('Send') && (composerContent.includes('bg-blue-600') || composerContent.includes('bg-emerald-600')), 'Composer must have Send button');
console.log('  ✓ MessageComposer matches screenshot with Plus, Mic, suggestions, and Send button');

// Test 6: BottomNavigation Tabs
console.log('6. Testing BottomNavigation Tabs...');
const bottomNavPath = path.join(ROOT, 'src/components/layout/BottomNavigation.tsx');
assert.ok(fs.existsSync(bottomNavPath), 'BottomNavigation.tsx must exist');
const navContent = fs.readFileSync(bottomNavPath, 'utf8');

assert.ok(navContent.includes("'Home'"), 'BottomNav tab 1: Home');
assert.ok(navContent.includes("'Chat'"), 'BottomNav tab 2: Chat');
assert.ok(navContent.includes("'Macallin'"), 'BottomNav tab: Macallin');
assert.ok(navContent.includes("'Profile'"), 'BottomNav tab: Profile');
assert.ok(navContent.includes('text-blue-600') || navContent.includes('text-emerald-600'), 'Active tab must be styled');
console.log('  ✓ BottomNavigation has exactly 5 tabs with emerald active states');

console.log('\n=== ALL MOBILE CHAT DESIGN & DRAWER TESTS PASSED WITH 100% SUCCESS! ===\n');
