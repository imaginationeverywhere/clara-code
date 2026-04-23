# Technical Plan Template

## MANDATORY: Brain Query Before Acting

Before you do anything for plans generated from this template:

1. Call `brain_query({ topic: "<the main subject of the plan — e.g. mempala brain hardening tenant isolation>", k: 5 })`.
2. Call `brain_query({ topic: "Mo's corrections and feedback relevant to this work", k: 5 })`.
3. Review the results. If ANY memory contradicts the instructions in the prompt or PRD, STOP and flag via the live feed (`auset-brain/Swarms/live-feed.md`). Mo's feedback wins.

If `brain_query` is unavailable, say so and use vault grep + `auset-brain/MOC.md` — do not fabricate institutional facts.

---

## [FEATURE_NAME] Architecture Plan

### Overview
[FEATURE_DESCRIPTION]

### Executive Summary
**Problem**: [PROBLEM_STATEMENT]
**Solution**: [SOLUTION_APPROACH]
**Benefits**: [KEY_BENEFITS]
**Timeline**: [TIME_ESTIMATE]
**Risk Level**: [RISK_LEVEL] - [RISK_JUSTIFICATION]

### Architecture Overview

#### Current State
[CURRENT_STATE]

#### Target Architecture
[TARGET_ARCHITECTURE]

#### Technology Stack
[TECH_STACK]

### Prerequisites

#### Infrastructure Requirements
[INFRASTRUCTURE_REQUIREMENTS]

#### Team Requirements
- Required skills: [REQUIRED_SKILLS]
- Team size: [TEAM_SIZE]
- Training needs: [TRAINING_NEEDS]

#### Technical Requirements
[TECHNICAL_REQUIREMENTS]

### Implementation Phases

#### Phase 1: Foundation & Setup (Week 1) - 20-40 hours
**Objective**: Establish foundation and core infrastructure

**Tasks**:
- Set up development environment and dependencies
- Create core architecture components
- Implement basic functionality

**Deliverables**:
- Development environment configured
- Core services/components implemented
- Basic functionality working

**Success Criteria**:
- All prerequisites met
- Foundation components functional
- Team aligned on approach

#### Phase 2: Core Implementation (Week 2-3) - 40-80 hours
**Objective**: Implement core feature functionality

**Tasks**:
- Develop main feature components
- Implement business logic
- Add error handling and validation

**Deliverables**:
- Core feature functionality complete
- Error handling implemented
- Basic testing in place

**Success Criteria**:
- All core features working
- Error scenarios handled
- Initial testing successful

#### Phase 3: Integration & Testing (Week 4) - 20-40 hours
**Objective**: Integrate with existing systems and comprehensive testing

**Tasks**:
- Integration with existing services
- Comprehensive testing (unit, integration, e2e)
- Performance optimization

**Deliverables**:
- Full integration complete
- Test suite implemented
- Performance optimized

**Success Criteria**:
- All integrations working
- Test coverage >90%
- Performance targets met

### Benefits & Value Proposition

#### For Developers
- Improved development experience
- Better code maintainability
- Enhanced debugging capabilities

#### For Operations
- Improved system reliability
- Better monitoring and observability
- Reduced operational overhead

#### For Business
- Enhanced user experience
- Improved business metrics
- Competitive advantage

### Risk Assessment & Mitigation

#### High Risk Items
| Risk | Impact | Likelihood | Mitigation |
|------|---------|------------|------------|
| [HIGH_RISK_ITEMS] | High | Medium | [HIGH_RISK_MITIGATION] |

#### Medium Risk Items
| Risk | Impact | Likelihood | Mitigation |
|------|---------|------------|------------|
| Integration complexity | Medium | Medium | Thorough testing and validation |
| Performance impact | Medium | Low | Performance testing and optimization |

#### Low Risk Items
| Risk | Impact | Likelihood | Mitigation |
|------|---------|------------|------------|
| Minor bugs | Low | Medium | Comprehensive testing |
| Documentation gaps | Low | Low | Regular documentation reviews |

### Success Metrics

#### Technical Metrics
- [TECHNICAL_METRICS]
- Code coverage >90%
- Performance within acceptable limits

#### Business Metrics
- [BUSINESS_METRICS]
- User satisfaction maintained/improved
- System reliability >99.9%

### Testing Strategy

#### Unit Tests
- Test all core business logic
- Mock external dependencies
- Aim for >90% code coverage

#### Integration Tests
- Test service integrations
- Validate data flow
- Test error scenarios

#### E2E Tests
- Test complete user workflows
- Validate user experience
- Performance testing

### Deployment Strategy

#### Environment Progression
1. **Development**: Local development and testing
2. **Staging**: Integration testing and validation
3. **Production**: Gradual rollout with monitoring

#### Rollout Plan
- Feature flags for gradual rollout
- Monitor key metrics during rollout
- 10% → 50% → 100% rollout strategy

#### Rollback Strategy
- Immediate rollback via feature flags
- Database rollback procedures if needed
- Communication plan for rollback scenarios

### Monitoring & Observability

#### Key Metrics
- [MONITORING_METRICS]
- System performance metrics
- Error rates and response times

#### Logging
- Comprehensive application logging
- Structured logging format
- Log retention per compliance requirements

### Security Considerations
- [SECURITY_CONSIDERATIONS]
- Input validation and sanitization
- Authentication and authorization
- Data encryption in transit and at rest

### Future Considerations
- Scalability planning for growth
- Enhancement opportunities
- Technical debt considerations

### References & Resources
- [Project Overview](../README.md)
- [Product Requirements Document](../docs/PRD.md)
- [System Architecture](../docs/technical/architecture.md)
- [Development Guide](../docs/DEVELOPMENT-GUIDE.md)
- [Team Contacts](../docs/TEAM-CONTACTS.md)

---

# Implementation Todo Template

## [FEATURE_NAME] Implementation Todos

### Overview
[FEATURE_DESCRIPTION]

### Project Information
- **Related Plan**: [`docs/technical/[FEATURE_SLUG]-architecture.md`](../docs/technical/[FEATURE_SLUG]-architecture.md)
- **Product Overview**: [QuikAction Construction Management Platform](../README.md)
- **System Architecture**: [Technical Architecture](../docs/technical/architecture.md)
- **Estimated Total Time**: [TIME_ESTIMATE]
- **Team Size**: [TEAM_SIZE]
- **Risk Level**: [RISK_LEVEL] - [RISK_JUSTIFICATION]
- **Dependencies**: [DEPENDENCIES]

### Prerequisites Checklist
[PREREQUISITES_CHECKLIST]

---

## Phase 1: Foundation & Setup (Week 1) - 20-40 hours

### 1.1 Environment Setup
**Priority**: High | **Estimated Time**: 8 hours | **Dependencies**: Development tools, access permissions

#### 1.1.1 Development Environment (4 hours)
- [ ] Set up development environment and tools
- [ ] Install required dependencies and libraries
- [ ] Configure environment variables and settings
- [ ] Verify development setup works correctly

#### 1.1.2 Project Structure (4 hours)
- [ ] Create project structure and directories
- [ ] Set up build configuration and scripts
- [ ] Configure linting and formatting tools
- [ ] Add project documentation templates

### 1.2 Core Infrastructure
**Priority**: High | **Estimated Time**: 12 hours | **Dependencies**: Environment setup

#### 1.2.1 Core Components (6 hours)
- [ ] Implement core service/component structure
- [ ] Add basic configuration management
- [ ] Set up logging and error handling
- [ ] Create utility functions and helpers

#### 1.2.2 Basic Integration (6 hours)
- [ ] Set up database connections if needed
- [ ] Configure API endpoints/routes
- [ ] Implement basic authentication/authorization
- [ ] Test basic functionality

---

## Phase 2: Core Implementation (Week 2-3) - 40-80 hours

### 2.1 Main Feature Development
**Priority**: High | **Estimated Time**: 24 hours | **Dependencies**: Core infrastructure

#### 2.1.1 Business Logic Implementation (12 hours)
- [ ] Implement core business logic and rules
- [ ] Add data validation and processing
- [ ] Create service layer and API endpoints
- [ ] Implement error handling and edge cases

#### 2.1.2 User Interface (12 hours)
- [ ] Create user interface components
- [ ] Implement user interactions and workflows
- [ ] Add responsive design and accessibility
- [ ] Test user experience and usability

### 2.2 Advanced Features
**Priority**: Medium | **Estimated Time**: 16 hours | **Dependencies**: Basic functionality

#### 2.2.1 Advanced Functionality (8 hours)
- [ ] Implement advanced feature requirements
- [ ] Add performance optimizations
- [ ] Create admin/configuration interfaces
- [ ] Implement monitoring and analytics

#### 2.2.2 Integration Points (8 hours)
- [ ] Integrate with existing systems/services
- [ ] Implement external API integrations
- [ ] Add data synchronization if needed
- [ ] Test all integration points

---

## Phase 3: Testing & Quality Assurance (Week 3-4) - 20-40 hours

### 3.1 Comprehensive Testing
**Priority**: High | **Estimated Time**: 16 hours | **Dependencies**: Feature implementation

#### 3.1.1 Unit Testing (8 hours)
- [ ] Write comprehensive unit tests
- [ ] Test all business logic and edge cases
- [ ] Mock external dependencies
- [ ] Achieve >90% code coverage

#### 3.1.2 Integration Testing (8 hours)
- [ ] Test service integrations
- [ ] Validate data flow and transformations
- [ ] Test error scenarios and recovery
- [ ] Performance and load testing

### 3.2 User Acceptance Testing
**Priority**: Medium | **Estimated Time**: 8 hours | **Dependencies**: Integration testing

#### 3.2.1 End-to-End Testing (4 hours)
- [ ] Test complete user workflows
- [ ] Validate business requirements
- [ ] Test across different devices/browsers
- [ ] User acceptance validation

#### 3.2.2 Security & Performance (4 hours)
- [ ] Security testing and validation
- [ ] Performance benchmarking
- [ ] Accessibility compliance testing
- [ ] Final quality assurance review

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code review completed and approved
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Performance benchmarks met
- [ ] Stakeholder approval obtained

### Deployment Steps
- [ ] Deploy to staging environment
- [ ] Run smoke tests in staging
- [ ] Configure production environment
- [ ] Deploy to production with feature flags
- [ ] Monitor deployment and key metrics
- [ ] Gradual rollout (10% → 50% → 100%)

### Post-Deployment
- [ ] Verify all functionality working
- [ ] Monitor error rates and performance
- [ ] User acceptance testing in production
- [ ] Documentation and training complete
- [ ] Success metrics validated
- [ ] Remove feature flags when stable

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)
- [ ] Disable feature flags to rollback quickly
- [ ] Verify system stability after rollback
- [ ] Notify stakeholders of rollback
- [ ] Begin incident analysis

### Graceful Rollback (< 30 minutes)
- [ ] Revert code deployment if needed
- [ ] Restore database backups if required
- [ ] Clear caches and restart services
- [ ] Validate system functionality
- [ ] Document rollback reasons and timeline

### Post-Rollback Analysis
- [ ] Analyze logs and error reports
- [ ] Document what went wrong
- [ ] Plan fixes for identified issues
- [ ] Update testing procedures to prevent recurrence

---

## Success Criteria & Validation

### Functional Criteria
- [ ] All feature requirements implemented
- [ ] User workflows functioning correctly
- [ ] Integration points working as expected
- [ ] Error handling working properly

### Performance Criteria
- [ ] [PERFORMANCE_CRITERIA]
- [ ] Response times within acceptable limits
- [ ] System throughput maintained
- [ ] Resource usage optimized

### Quality Criteria
- [ ] Code quality standards met
- [ ] Security requirements satisfied
- [ ] Documentation complete and accurate
- [ ] Test coverage >90%

---

## Risk Mitigation

### Known Risks
- **Risk**: [HIGH_RISK_ITEMS]
  - **Mitigation**: [HIGH_RISK_MITIGATION]
  - **Contingency**: Have rollback plan ready and tested

### Monitoring Points
- [ ] Monitor error rates during implementation
- [ ] Watch for performance degradation
- [ ] Track user feedback and issues
- [ ] Monitor integration points

---

## Documentation Requirements
- [ ] API documentation updated
- [ ] User guide created/updated
- [ ] Operational runbook updated
- [ ] Architecture documentation updated
- [ ] Code comments and inline documentation

---

## Best Practices Checklist
- [ ] Follow established coding standards
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Use consistent naming conventions
- [ ] Implement security best practices
- [ ] Add proper input validation
- [ ] Optimize for performance
- [ ] Ensure accessibility compliance

---

## Completion Checklist
- [ ] All implementation phases complete
- [ ] All tests passing with >90% coverage
- [ ] Documentation complete and reviewed
- [ ] Team trained on new functionality
- [ ] Monitoring and alerting operational
- [ ] Success criteria validated
- [ ] Stakeholder acceptance obtained

---

**Next Steps After Completion:**
1. Monitor system stability for 30 days
2. Gather user feedback and usage analytics
3. Plan performance optimizations if needed
4. Document lessons learned
5. Plan next iteration or enhancements
6. Update development processes based on learnings