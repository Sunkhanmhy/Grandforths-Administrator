import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { readStoredSession, signInWithEmailPassword, signOut, signUpWithEmailPassword } from './lib/supabase'

type RoleKey = 'super_admin' | 'hr' | 'it_support' | 'finance' | 'operations'

type AdminRole = {
  key: RoleKey
  label: string
  icon: string
  summary: string
}

type InviteForm = {
  name: string
  email: string
  role: RoleKey
}

const roleConfig: Record<RoleKey, AdminRole> = {
  super_admin: { key: 'super_admin', label: 'Super Admin', icon: '◎', summary: 'Platform-wide governance, security, and client control.' },
  hr: { key: 'hr', label: 'HR', icon: '◌', summary: 'Talent management, onboarding, leave, and workforce operations.' },
  it_support: { key: 'it_support', label: 'IT Support', icon: '▣', summary: 'System reliability, support queues, and access control.' },
  finance: { key: 'finance', label: 'Finance', icon: '◫', summary: 'Billing, payments, and financial controls.' },
  operations: { key: 'operations', label: 'Operations', icon: '◈', summary: 'Client delivery, case management, and service coordination.' },
}

const roleOrder: RoleKey[] = ['super_admin', 'hr', 'it_support', 'finance', 'operations']

const initialInvites: InviteForm[] = [
  { name: 'Aisha Bello', email: 'aisha.bello@grandforthlegal.com', role: 'hr' },
  { name: 'David Okafor', email: 'david.okafor@grandforthlegal.com', role: 'it_support' },
  { name: 'Lilian Ubah', email: 'lilian.ubah@grandforthlegal.com', role: 'finance' },
]

function App() {
  const [session, setSession] = useState(() => readStoredSession())
  const [role, setRole] = useState<RoleKey>('super_admin')

  const activeRole = roleConfig[role] ?? roleConfig.super_admin

  if (!session) {
    return <AuthScreen onSignedIn={(nextSession) => { setSession(nextSession); setRole('super_admin') }} />
  }

  return <AdminShell session={session} role={activeRole} onRoleChange={setRole} onSignOut={() => setSession(null)} />
}

function AuthScreen({ onSignedIn }: { onSignedIn: (session: any) => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('admin@grandforthlegal.com')
  const [password, setPassword] = useState('Admin123!')
  const [fullName, setFullName] = useState('Super Admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = mode === 'signin'
        ? await signInWithEmailPassword(email, password)
        : await signUpWithEmailPassword(email, password, fullName)

      if (result.error) {
        setError(result.error.message || 'Authentication failed.')
        return
      }

      if (result.data?.session) {
        onSignedIn(result.data.session)
      }
    } catch (err) {
      setError((err as Error).message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="brand-lockup">
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-title">Grandforth Legal Practitioners</div>
            <div className="brand-subtitle">Administrator Portal</div>
          </div>
        </div>

        <div className="auth-switch">
          <button type="button" className={mode === 'signin' ? 'toggle active' : 'toggle'} onClick={() => setMode('signin')}>Sign In</button>
          <button type="button" className={mode === 'signup' ? 'toggle active' : 'toggle'} onClick={() => setMode('signup')}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <label className="field">
              <span className="field-label">Full name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
            </label>
          )}

          <label className="field">
            <span className="field-label">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@grandforthlegal.com" />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
          </label>

          {error && <div className="alert-box">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Access dashboard' : 'Create administrator'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AdminShell({ session, role, onRoleChange, onSignOut }: { session: any, role: AdminRole, onRoleChange: (role: RoleKey) => void, onSignOut: () => void }) {
  const [invites, setInvites] = useState<InviteForm[]>(initialInvites)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = useMemo(() => {
    const list = role.key === 'super_admin'
      ? [
          { label: 'Overview', path: '/dashboard', icon: '⌂' },
          { label: 'Clients', path: '/clients', icon: '◍' },
          { label: 'Invite Admins', path: '/invites', icon: '＋' },
          { label: 'Audit Log', path: '/audit', icon: '✓' },
        ]
      : role.key === 'hr'
        ? [
            { label: 'Overview', path: '/dashboard', icon: '⌂' },
            { label: 'Staff', path: '/people', icon: '◔' },
            { label: 'Leave', path: '/leave', icon: '☼' },
            { label: 'Policy', path: '/policy', icon: '▣' },
          ]
        : role.key === 'it_support'
          ? [
              { label: 'Overview', path: '/dashboard', icon: '⌂' },
              { label: 'Tickets', path: '/tickets', icon: '◌' },
              { label: 'Assets', path: '/assets', icon: '▤' },
              { label: 'Security', path: '/security', icon: '◈' },
            ]
          : role.key === 'finance'
            ? [
                { label: 'Overview', path: '/dashboard', icon: '⌂' },
                { label: 'Invoices', path: '/billing', icon: '◫' },
                { label: 'Payments', path: '/payments', icon: '◬' },
                { label: 'Forecasts', path: '/forecast', icon: '▦' },
              ]
            : [
                { label: 'Overview', path: '/dashboard', icon: '⌂' },
                { label: 'Delivery', path: '/delivery', icon: '⇢' },
                { label: 'Cases', path: '/cases', icon: '☰' },
                { label: 'Reports', path: '/reports', icon: '▣' },
              ]

    return list
  }, [role.key])

  const handleSignOut = async () => {
    await signOut()
    onSignOut()
    navigate('/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-title">Grandforth Legal Practitioners</div>
            <div className="brand-subtitle">Admin Console</div>
          </div>
        </div>

        <div className="role-switcher">
          <label className="mini-label">Active role</label>
          <select value={role.key} onChange={(e) => onRoleChange(e.target.value as RoleKey)}>
            {roleOrder.map((item) => (
              <option key={item} value={item}>{roleConfig[item].label}</option>
            ))}
          </select>
        </div>

        <nav className="side-nav">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="signout-button" onClick={handleSignOut}>Sign Out</button>
      </aside>

      <main className="admin-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{role.label}</p>
            <h1>{role.summary}</h1>
          </div>
          <div className="user-pill">
            <div className="user-avatar">{session.user?.email?.slice(0, 1).toUpperCase() ?? 'A'}</div>
            <div>
              <strong>{session.user?.email ?? 'Administrator'}</strong>
              <span>{location.pathname.replace('/', '') || 'dashboard'}</span>
            </div>
          </div>
        </header>

        <div className="content-panel">
          <Routes>
            <Route path="/dashboard" element={<DashboardView role={role} />} />
            <Route path="/clients" element={<ClientsView />} />
            <Route path="/invites" element={<InviteAdminView invites={invites} setInvites={setInvites} />} />
            <Route path="/audit" element={<AuditView />} />
            <Route path="/people" element={<PeopleView />} />
            <Route path="/leave" element={<LeaveView />} />
            <Route path="/policy" element={<PolicyView />} />
            <Route path="/tickets" element={<TicketView />} />
            <Route path="/assets" element={<AssetsView />} />
            <Route path="/security" element={<SecurityView />} />
            <Route path="/billing" element={<BillingView />} />
            <Route path="/payments" element={<PaymentsView />} />
            <Route path="/forecast" element={<ForecastView />} />
            <Route path="/delivery" element={<DeliveryView />} />
            <Route path="/cases" element={<CasesView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function DashboardView({ role }: { role: AdminRole }) {
  const metrics = {
    super_admin: [
      { label: 'Active clients', value: '1,284' },
      { label: 'Open advisories', value: '36' },
      { label: 'Security alerts', value: '02' },
    ],
    hr: [
      { label: 'Staff', value: '184' },
      { label: 'Leave requests', value: '11' },
      { label: 'Onboarding', value: '07' },
    ],
    it_support: [
      { label: 'Open tickets', value: '24' },
      { label: 'Resolved today', value: '18' },
      { label: 'System uptime', value: '99.9%' },
    ],
    finance: [
      { label: 'Invoices', value: '480' },
      { label: 'Due this week', value: '12' },
      { label: 'Collections', value: '94%' },
    ],
    operations: [
      { label: 'Cases', value: '63' },
      { label: 'Deliveries', value: '29' },
      { label: 'Priority escalations', value: '04' },
    ],
  }[role.key]

  return (
    <section className="dashboard-grid">
      <div className="stats-row">
        {metrics.map((item) => (
          <article key={item.label} className="stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <div className="card-panel">
        <h3>Operational summary</h3>
        <ul className="bullet-list">
          <li>Client portal data is synchronized with Supabase and protected by row-level access rules.</li>
          <li>Admin roles are scoped by permission and require active profile validation.</li>
          <li>All system changes are versioned with audit logs for compliance review.</li>
        </ul>
      </div>
    </section>
  )
}

function ClientsView() {
  return (
    <section className="table-card">
      <h3>Client portfolio</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Account</th>
            <th>Last activity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>John Okafor</td><td>Corporate advisory</td><td>2 hours ago</td><td><span className="status-badge success">Active</span></td></tr>
          <tr><td>Amina Yusuf</td><td>Employment law</td><td>1 day ago</td><td><span className="status-badge neutral">Review</span></td></tr>
          <tr><td>Williams & Sons</td><td>Compliance</td><td>3 days ago</td><td><span className="status-badge success">Active</span></td></tr>
        </tbody>
      </table>
    </section>
  )
}

function InviteAdminView({ invites, setInvites }: { invites: InviteForm[], setInvites: Dispatch<SetStateAction<InviteForm[]>> }) {
  const [form, setForm] = useState<InviteForm>({ name: '', email: '', role: 'hr' })

  const handleAdd = () => {
    if (!form.name || !form.email) return
    setInvites((current) => [...current, { ...form }])
    setForm({ name: '', email: '', role: 'hr' })
  }

  return (
    <section className="stacked-card">
      <h3>Invite new admin</h3>
      <div className="invite-form">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as RoleKey })}>
          {roleOrder.filter((item) => item !== 'super_admin').map((item) => (
            <option key={item} value={item}>{roleConfig[item].label}</option>
          ))}
        </select>
        <button type="button" className="primary-button" onClick={handleAdd}>Send invite</button>
      </div>

      <div className="list-block">
        {invites.map((invite) => (
          <div className="list-row" key={`${invite.email}-${invite.role}`}>
            <div>
              <strong>{invite.name}</strong>
              <small>{invite.email}</small>
            </div>
            <span className="status-badge neutral">{roleConfig[invite.role].label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function AuditView() { return <section className="stacked-card"><h3>Audit trail</h3><ul className="bullet-list"><li>Super admin approved access for Finance role at 10:07 AM.</li><li>Client portal login from new device successfully verified.</li><li>Security policy review completed for three privileged accounts.</li></ul></section> }
function PeopleView() { return <section className="stacked-card"><h3>HR overview</h3><ul className="bullet-list"><li>12 employees are due for annual review.</li><li>3 new hires are in the onboarding pipeline.</li><li>2 leave approvals are pending manager sign-off.</li></ul></section> }
function LeaveView() { return <section className="stacked-card"><h3>Leave tracker</h3><ul className="bullet-list"><li>Annual leave: 23 pending.</li><li>Sick leave: 6 active.</li><li>Parental leave: 2 active.</li></ul></section> }
function PolicyView() { return <section className="stacked-card"><h3>Policy updates</h3><ul className="bullet-list"><li>Remote work policy review scheduled for Friday.</li><li>Compliance training completion rate is 96%.</li><li>Document retention policy requires approval.</li></ul></section> }
function TicketView() { return <section className="stacked-card"><h3>IT support queue</h3><ul className="bullet-list"><li>Client portal authentication issue escalated.</li><li>Device provisioning for 4 remote users pending.</li><li>Security patching for 11 endpoints completed.</li></ul></section> }
function AssetsView() { return <section className="stacked-card"><h3>Asset register</h3><ul className="bullet-list"><li>182 company devices tracked.</li><li>12 assets are due for replacement.</li><li>4 warranties nearing expiry.</li></ul></section> }
function SecurityView() { return <section className="stacked-card"><h3>Security posture</h3><ul className="bullet-list"><li>Multi-factor authentication is enforced for all administrators.</li><li>Privileged access is monitored for suspicious activity.</li><li>Session expiry and audit log retention are active.</li></ul></section> }
function BillingView() { return <section className="stacked-card"><h3>Billing ledger</h3><ul className="bullet-list"><li>Outstanding invoices: 18.</li><li>Formal demand letters queued: 3.</li><li>Collections success rate: 91%.</li></ul></section> }
function PaymentsView() { return <section className="stacked-card"><h3>Payment tracking</h3><ul className="bullet-list"><li>Card payments processed this week: 214.</li><li>Bank transfers pending: 9.</li><li>Dispute review count: 2.</li></ul></section> }
function ForecastView() { return <section className="stacked-card"><h3>Financial forecast</h3><ul className="bullet-list"><li>Quarterly revenue trend is above target by 7%.</li><li>Client retainer renewal pipeline remains strong.</li><li>Cash flow remains stable with positive margin.</li></ul></section> }
function DeliveryView() { return <section className="stacked-card"><h3>Operations delivery</h3><ul className="bullet-list"><li>3 matter schedules need follow-up this week.</li><li>14 service requests are on track.</li><li>2 escalations are due for client communication.</li></ul></section> }
function CasesView() { return <section className="stacked-card"><h3>Case pipeline</h3><ul className="bullet-list"><li>Corporate governance matters: 12.</li><li>Employment advisory matters: 9.</li><li>Litigation support: 5.</li></ul></section> }
function ReportsView() { return <section className="stacked-card"><h3>Executive reports</h3><ul className="bullet-list"><li>Client satisfaction trend is positive.</li><li>Service availability exceeded target.</li><li>Security compliance is green across the platform.</li></ul></section> }

export default App
