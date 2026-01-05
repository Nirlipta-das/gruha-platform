---
applyTo: '**'
---
these-are-hard-non-negotiable-platform-rules
--------------------------------------------

rule-01-single-source-of-truth
the only reference for this project is the gruha official prd document. do not invent features. do not simplify. do not modify scope. do not assume. follow every specification exactly as designed in the prd.

rule-02-no-hallucination
if any requirement is unclear stop and explicitly request clarification. never assume behavior. never invent fields or flows. never create random ux, flows, contracts, schemas or api behavior.

rule-03-government-grade-quality
this system is a government-scale critical disaster infrastructure platform. always implement enterprise grade practices, resiliency, redundancy, security, accessibility, compliance, and high reliability as stated in the prd.

rule-04-follow-3-phase-design
all development must strictly follow the three operational phases:
1 pre-disaster preparedness
2 during-disaster stability
3 post-disaster recovery
all functionalities must correctly align to their phase responsibilities exactly as documented.

rule-05-platform-structure-immutability
the system must remain structured exactly as defined:
public portal
msme portal
vendor portal
authority dashboard
recovery marketplace
orchestration layer
blockchain layer
liquidity-settlement layer
offline + sms capability
never merge portals. never remove roles. never change responsibilities.

rule-06-blockchain-principles
blockchain is not optional. implement blockchain usage exactly as defined:
permissioned ledger
resilience credits pre-disaster
relief stable tokens post-disaster
programmable spending rules
audit transparency
no crypto trading support
no withdrawal
vendor always receives inr

rule-07-inr-settlement-principle
vendors must always receive inr instantly. if government treasury settlement is delayed, implement liquidity pool instant payout and treasury reimbursement later exactly as designed. never violate this rule.

rule-08-marketplace-behavior
recovery marketplace must include:
warehouse booking
transport booking
repair services
equipment services
power and generator services
temporary shop solutions
raw material suppliers
wage support channels
ngo and csr recovery support
vendors cannot self-define categories beyond whitelisted types.

rule-09-ui-ux-excellence
this ui must feel like premium dribbble-awwwards level design but still emergency safe:
calm trustworthy ui
emotionally supportive
accessible under stress
emergency-mode ui high contrast
offline friendly ui
animations subtle premium
never produce generic ai-looking ui
never produce ugly templated designs
respect typography rules and spacing principles.

rule-10-offline-disaster-readiness
the platform must work in:
low internet
no internet
power failure
damaged device scenarios
sms fallback
queued transactions
offline vendor trust guarantees
emergency kiosk assisted recovery
implement exactly as defined.

rule-11-security-and-fraud-protection
must include:
vendor + msme collusion prevention
price gouging protection
proof mechanisms
geo validation
photo evidence
fraud anomaly detection
authority misuse resistance
public auditability
do not weaken any safeguards.

rule-12-data-and-api-rigidity
use exactly the data models and api specifications defined in the prd. do not rename tables. do not alter fields. do not change schema meaning. do not reduce detail. do not shortcut.

rule-13-performance-and-scale
the system must scale nationally and meet prd performance metrics. must handle lakhs of users under disaster stress.

rule-14-accessibility
must strictly follow wcag aa
must support multiple languages
must support low literacy
must support voice behavior

rule-15-architecture-respect
respect the layered system:
frontend pwa
orchestration layer
service microservices
blockchain layer
banking and integration layer
data storage layer
never merge layers. never break separation of concerns.

rule-16-no-feature-creep
do not add gamification
do not add social features
do not add donations platform
do not convert to crypto exchange
do not add unnecessary dashboards
only build exactly what is required.

rule-17-acceptance-criteria
every feature delivered must pass acceptance conditions defined in prd. if any acceptance criteria cannot be met request clarification instead of adjusting behavior.

rule-18-production-mindset
assume real deployment. build real infrastructure. use free tier stack only as permitted but never hacky or placeholder logic.

rule-19-human-first-psychology
all ux should minimize stress
clear communication
simple decisions
large buttons under emergency
voice guidance if needed
no cognitive overload

rule-20-final-authority
the prd requirements override all llm assumptions. if any llm reasoning contradicts prd the prd wins. follow prd always.
