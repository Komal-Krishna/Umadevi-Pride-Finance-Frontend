'use client'

import { AlertTriangle, TrendingUp, TrendingDown, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RiskAnalysisProps {
  data: any
}

export default function RiskAnalysis({ data }: RiskAnalysisProps) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No risk data available</p>
      </div>
    )
  }

  const riskMetrics = [
    {
      title: 'Overall Risk Score',
      value: data.risk_score || 0,
      icon: Shield,
      color: 'primary',
      change: '-2.5',
      changeType: 'positive'
    },
    {
      title: 'Overdue Payments',
      value: data.overdue_payments || 0,
      icon: AlertCircle,
      color: 'danger',
      change: '+1',
      changeType: 'negative'
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(data.overdue_amount || 0),
      icon: TrendingDown,
      color: 'danger',
      change: '+₹5,000',
      changeType: 'negative'
    },
    {
      title: 'High Risk Customers',
      value: data.high_risk_customers?.length || 0,
      icon: AlertTriangle,
      color: 'warning',
      change: '0',
      changeType: 'neutral'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary-50 text-primary-700 border-primary-200'
      case 'success':
        return 'bg-success-50 text-success-700 border-success-200'
      case 'warning':
        return 'bg-warning-50 text-warning-700 border-warning-200'
      case 'danger':
        return 'bg-danger-50 text-danger-700 border-danger-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low', color: 'success', bg: 'bg-success-50', text: 'text-success-800' }
    if (score <= 60) return { level: 'Medium', color: 'warning', bg: 'bg-warning-50', text: 'text-warning-800' }
    return { level: 'High', color: 'danger', bg: 'bg-danger-50', text: 'text-danger-800' }
  }

  const riskLevel = getRiskLevel(data.risk_score || 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Risk Analysis</h2>
        <p className="text-gray-600">Comprehensive risk assessment and mitigation strategies</p>
      </div>

      {/* Risk Score Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Risk Assessment</h3>
            <p className="text-gray-600">Current risk level and trends</p>
          </div>
          <div className={`p-4 rounded-full ${riskLevel.bg}`}>
            <Shield className={`h-8 w-8 ${riskLevel.text}`} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Risk Score</span>
              <span className={`text-2xl font-bold ${riskLevel.text}`}>
                {data.risk_score || 0}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  riskLevel.color === 'success' ? 'bg-success-500' :
                  riskLevel.color === 'warning' ? 'bg-warning-500' : 'bg-danger-500'
                }`}
                style={{ width: `${Math.min((data.risk_score || 0), 100)}%` }}
              ></div>
            </div>
            <p className={`text-sm mt-2 ${riskLevel.text}`}>
              Risk Level: {riskLevel.level}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Previous Score</span>
              <span className="text-sm font-medium text-gray-900">42.5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Change</span>
              <span className="text-sm font-medium text-success-600">-2.5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trend</span>
              <span className="text-sm font-medium text-success-600">Improving</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {riskMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${getColorClasses(metric.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center text-sm ${
                  metric.changeType === 'positive' ? 'text-success-600' : 
                  metric.changeType === 'negative' ? 'text-danger-600' : 'text-gray-600'
                }`}>
                  {metric.changeType === 'positive' ? (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  ) : metric.changeType === 'negative' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <div className="w-4 h-4 mr-1"></div>
                  )}
                  {metric.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Risk Factors Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors & Mitigation</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Identified Risk Factors</h4>
            <div className="space-y-3">
              {[
                { factor: 'Late Payments', severity: 'Medium', impact: 'Medium', status: 'Active' },
                { factor: 'Extended Rental Periods', severity: 'Low', impact: 'Low', status: 'Monitoring' },
                { factor: 'Customer Default Risk', severity: 'High', impact: 'High', status: 'Active' },
                { factor: 'Market Volatility', severity: 'Medium', impact: 'Medium', status: 'Monitoring' }
              ].map((risk, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{risk.factor}</p>
                    <p className="text-sm text-gray-600">Severity: {risk.severity}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      risk.severity === 'High' ? 'bg-red-100 text-red-800' :
                      risk.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {risk.severity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{risk.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Mitigation Strategies</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h5 className="text-sm font-medium text-blue-800 mb-2">Immediate Actions</h5>
                <div className="text-sm text-blue-700">
                  <p>• Contact overdue customers within 24 hours</p>
                  <p>• Implement stricter payment terms for new customers</p>
                  <p>• Review high-risk customer accounts weekly</p>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="text-sm font-medium text-green-800 mb-2">Short-term (1-3 months)</h5>
                <div className="text-sm text-green-700">
                  <p>• Implement automated payment reminders</p>
                  <p>• Develop customer risk scoring system</p>
                  <p>• Regular payment status reviews</p>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <h5 className="text-sm font-medium text-yellow-800 mb-2">Long-term (3-12 months)</h5>
                <div className="text-sm text-yellow-700">
                  <p>• Build customer relationship management system</p>
                  <p>• Develop predictive risk models</p>
                  <p>• Implement insurance coverage for high-value assets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Trends Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Trends Over Time</h3>
        <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center">
            <TrendingDown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Risk trends chart will be displayed here</p>
            <p className="text-sm text-gray-400">Monthly risk score changes and trends</p>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Risk Alerts</h3>
        <div className="space-y-3">
          {[
            { 
              alert: 'Customer John Smith - Payment overdue by 15 days', 
              severity: 'High', 
              time: '2 hours ago',
              action: 'Immediate contact required'
            },
            { 
              alert: 'Vehicle ABC-123 - Extended rental period detected', 
              severity: 'Medium', 
              time: '1 day ago',
              action: 'Review rental terms'
            },
            { 
              alert: 'Interest payment delayed for loan #456', 
              severity: 'Medium', 
              time: '2 days ago',
              action: 'Send payment reminder'
            }
          ].map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'High' ? 'bg-red-50 border-red-500' :
              alert.severity === 'Medium' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`font-medium ${
                    alert.severity === 'High' ? 'text-red-800' :
                    alert.severity === 'Medium' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {alert.alert}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{alert.action}</p>
                </div>
                <div className="text-right ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    alert.severity === 'High' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
