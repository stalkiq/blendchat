# BlendChat Product Vision & Functionality

## 🎯 Core Concept
**"The AI for Groups"** - BlendChat enables teams to collaborate with AI together, sharing context and co-creating solutions in a unified conversation space.

---

## 🔐 Authentication Flow

### Sign In Experience
1. **Landing Page** (`/`)
   - Hero section with tagline: "The AI for Groups"
   - Dark blue "Sign in with Google" button (prominent, branded)
   - "See pricing" secondary button
   - "How it works" section explaining the value prop

2. **Google OAuth Integration**
   - Click "Sign in with Google" → Redirect to Google OAuth
   - User authenticates with Google account
   - Seamless redirect back to app
   - Show "Redirecting to chat..." loading spinner
   - **Auto-redirect to `/chat` after successful authentication**

3. **User Profile Creation**
   - Automatically create user profile from Google account:
     - Profile picture (from Google)
     - Full name (from Google)
     - Email address (from Google)
     - Unique user ID (from Cognito)

---

## 💬 Chat Interface (`/chat`)

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ SIDEBAR (Left)          │  MAIN CHAT AREA (Right)  │
│                         │                           │
│ [👤 Profile]            │  Chat Header              │
│  User Name              │                           │
│  user@email.com         │  ━━━━━━━━━━━━━━━━━━━━━━  │
│  [➕ New] [🚪 Logout]   │                           │
│                         │  Chat Messages            │
│ ━━━━━━━━━━━━━━━━━━━━   │  (or empty state)         │
│                         │                           │
│ 📝 Chat History         │                           │
│   > Chat 1              │                           │
│   > Chat 2              │  ━━━━━━━━━━━━━━━━━━━━━━  │
│   > Chat 3              │                           │
│                         │  [Red/Burgundy Prompt]    │
│ 👥 Participants         │  [➕] Type message... [⬆]│
│   (if in a chat)        │                           │
└─────────────────────────────────────────────────────┘
```

### User Profile Display (Top Left Sidebar)
- **Profile Picture**: Google avatar (circular)
- **Name**: Full name from Google account
- **Email**: Email address (smaller, muted text)
- **Action Buttons**:
  - New Chat button (➕)
  - Sign Out button (🚪)

### Empty State (No Chat Selected)
**Centered on main area:**
- Large heading: "How can we help today?"
- Subheading: "Start with a prompt below or ask anything."
- 2 suggested prompts (clickable cards)
- **Red/burgundy prompt box** at bottom:
  - Dark red background (#1a0b0b)
  - Red border (border-red-900)
  - Plus icon on left
  - Text input in center
  - Arrow up button on right

---

## 👥 Group Chat Features

### Creating a New Chat
1. Click "New Chat" button OR type in empty state prompt box
2. **Before sending first message:**
   - Show "Add Users" button with participant selector
   - User can select multiple team members
   - Selected participants shown with avatars

3. **After sending first message:**
   - Chat is created with all selected participants
   - All participants can see the conversation
   - All participants can interact with the AI

### Multi-User Collaboration
- **Shared Context**: All messages visible to all participants
- **Group Interaction**: Any participant can ask follow-up questions
- **AI Awareness**: AI understands it's talking to a group
- **Consistent Memory**: Chat history persists for all participants
- **Visual Indicators**: Show which user sent each message

### Participant Management
- **Sidebar Participants Section** (when in a chat):
  - Shows avatars of all participants
  - Stacked/overlapping avatar display
  - Hover to see names
- **Add More Participants** (future feature):
  - Ability to invite more people mid-conversation

---

## 🎨 Design & UX

### Color Scheme
- **Primary**: Dark theme (background dark, text light)
- **Accent**: Dark blue for buttons (#1a237e)
- **Prompt Box**: Deep red/burgundy (#1a0b0b with red-900 border)
- **Cards**: Subtle card backgrounds with borders

### Typography
- **Headline Font**: Space Grotesk (modern, bold)
- **Body Font**: Inter (clean, readable)
- **Sizes**: Large headlines, clear hierarchy

### Interactive Elements
- **Hover States**: All buttons have smooth transitions
- **Loading States**: Spinners and feedback during actions
- **Shadows**: Subtle elevation for buttons and cards
- **Animations**: Smooth transitions (300ms)

---

## 🔄 User Flows

### First-Time User Journey
1. Land on homepage
2. See value proposition
3. Click "Sign in with Google"
4. Authenticate with Google
5. Auto-redirect to chat interface
6. See empty state with prompt suggestions
7. Type first message or click suggestion
8. Select team members (optional)
9. Send message
10. Receive AI response
11. Continue conversation

### Returning User Journey
1. Land on homepage
2. Automatically detect existing session
3. Show "Redirecting to chat..." immediately
4. Auto-redirect to `/chat`
5. Show previous chat history in sidebar
6. Resume or start new conversation

### Sign Out Flow
1. Click sign out button (top right)
2. Clear authentication session
3. Redirect to homepage
4. Ready for next sign-in

---

## 💡 Key Features & Differentiators

### What Makes BlendChat Unique
1. **Group-First Design**: Built for teams, not individuals
2. **Shared Context**: Everyone sees the same conversation
3. **Collaborative AI**: AI responds to group dynamics
4. **Persistent History**: All conversations saved and accessible
5. **Simple Onboarding**: One-click Google sign-in
6. **Professional UI**: Clean, modern, distraction-free

### Use Cases
- **Team Brainstorming**: Multiple people ideating with AI
- **Problem Solving**: Group debugging or troubleshooting
- **Decision Making**: AI helps team weigh options together
- **Knowledge Sharing**: Team learns collectively from AI
- **Project Planning**: Collaborative planning with AI assistance

---

## 🔧 Technical Architecture

### Authentication
- **Provider**: AWS Cognito + Google OAuth 2.0
- **Session**: Secure token-based authentication
- **Profile**: Auto-populated from Google account

### Frontend
- **Framework**: Next.js 15 (React, TypeScript)
- **Styling**: Tailwind CSS (dark theme)
- **State**: React Context (Auth, User)
- **UI Components**: shadcn/ui (Radix UI primitives)

### Backend
- **User Pool**: AWS Cognito
- **Data Storage**: DynamoDB (future: chat history)
- **AI API**: Google Genkit / custom chat API
- **Deployment**: AWS Amplify

### Data Model
```typescript
User {
  id: string          // Cognito user ID
  email: string       // From Google
  name: string        // From Google
  picture: string     // Google profile picture URL
}

Chat {
  id: string
  title: string
  users: User[]       // Participants
  messages: Message[]
  createdAt: timestamp
}

Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  user?: User         // If sender = 'user'
  createdAt: timestamp
}
```

---

## 🚀 Future Enhancements

### Phase 2 Features
- [ ] Real-time collaboration (WebSockets)
- [ ] Message reactions and threading
- [ ] File uploads and attachments
- [ ] Voice input
- [ ] Chat search and filtering
- [ ] Export conversations

### Phase 3 Features
- [ ] Custom AI models/personas
- [ ] Integrations (Slack, Teams, etc.)
- [ ] Admin dashboard
- [ ] Usage analytics
- [ ] Team workspace management
- [ ] Enterprise SSO

### Phase 4 Features
- [ ] Mobile apps (iOS/Android)
- [ ] API for third-party integrations
- [ ] Webhooks and automations
- [ ] Custom branding for enterprises
- [ ] Advanced permissions and roles

---

## 📊 Success Metrics

### User Engagement
- Sign-up conversion rate
- Daily active users (DAU)
- Messages per session
- Return user rate
- Average session duration

### Collaboration Metrics
- Average participants per chat
- Multi-user chat percentage
- Group interaction rate
- Shared chat usage

### Quality Metrics
- User satisfaction (NPS)
- Feature adoption rate
- Error rate / crash-free sessions
- Response time (AI)

---

## 🎯 Product Principles

1. **Simplicity First**: One-click sign-in, intuitive interface
2. **Group-Centric**: Every feature designed for teams
3. **Fast & Responsive**: No waiting, immediate feedback
4. **Beautiful Design**: Professional, modern, distraction-free
5. **Privacy-Focused**: Secure authentication, data protection
6. **Reliable**: Always available, consistent performance

---

## 🔐 Security & Privacy

### Authentication Security
- OAuth 2.0 standard compliance
- Secure token storage (httpOnly cookies)
- Session timeout and refresh
- CSRF protection

### Data Privacy
- User data encrypted at rest and in transit
- No data sharing with third parties
- GDPR compliance ready
- User data deletion on request

### Infrastructure Security
- AWS security best practices
- VPC isolation
- Regular security audits
- SSL/TLS everywhere

---

## 🌐 Deployment & Operations

### Environments
- **Development**: `localhost:9002`
- **Staging**: `main.d2cianvz4vv9ue.amplifyapp.com`
- **Production**: `www.chatbudi.com` (when DNS configured)

### CI/CD Pipeline
1. Git push to main branch
2. GitHub Actions runs CI (lint, typecheck, build)
3. Amplify auto-deploys frontend
4. CDK deploys infrastructure changes (manual)

### Monitoring
- AWS CloudWatch for logs
- Amplify build monitoring
- Error tracking (future: Sentry)
- Performance monitoring (future: analytics)

---

## 📖 Documentation

### For Developers
- `README.md` - Setup and development
- `ARCHITECTURE.md` - System design
- `GOOGLE_OAUTH_SETUP.md` - Auth configuration
- `DEPLOY.md` - Deployment instructions

### For Users
- In-app tooltips and hints
- Help center (future)
- Video tutorials (future)

---

## 💼 Business Model

### Pricing Tiers (Future)
1. **Free Tier**: Limited messages, basic features
2. **Pro**: Unlimited messages, advanced features
3. **Team**: Multi-user, collaboration features
4. **Enterprise**: Custom deployment, SSO, support

---

## ✨ Brand Voice & Messaging

### Tagline
"The AI for Groups"

### Value Propositions
- "Collaborate with AI together"
- "Share context, co-create, decide as a team"
- "AI that understands group dynamics"
- "One conversation, multiple perspectives"

### Target Audience
- Remote teams
- Product development teams
- Creative agencies
- Consulting firms
- Educational groups
- Research teams

---

## 🎨 Visual Identity

### Logo
BlendChat logo (stylized "BC" or text)

### Brand Colors
- **Primary**: Dark Blue (#1a237e)
- **Accent**: Deep Red/Burgundy (#1a0b0b)
- **Background**: Dark (#0a0a0a)
- **Text**: Light (#ffffff)

### Design System
- Modern, professional
- Dark mode first
- Clean typography
- Generous whitespace
- Clear visual hierarchy

---

**This is BlendChat** - where teams and AI collaborate seamlessly. 🚀

