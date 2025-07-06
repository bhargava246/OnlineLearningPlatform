import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, Shield, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface FinanceCalculatorProps {
  carPrice: string | number;
  showTitle?: boolean;
}

export default function FinanceCalculator({ carPrice, showTitle = true }: FinanceCalculatorProps) {
  const [downPayment, setDownPayment] = useState("5000");
  const [loanTerm, setLoanTerm] = useState("60");
  const [interestRate, setInterestRate] = useState("6.5");
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [creditScore, setCreditScore] = useState("700");

  // Get estimated interest rate based on credit score
  const getEstimatedRate = (score: string) => {
    const scoreNum = parseInt(score);
    if (scoreNum >= 750) return "4.5";
    if (scoreNum >= 700) return "6.5";
    if (scoreNum >= 650) return "8.5";
    if (scoreNum >= 600) return "12.0";
    return "15.0";
  };

  // Update interest rate when credit score changes
  const handleCreditScoreChange = (score: string) => {
    setCreditScore(score);
    setInterestRate(getEstimatedRate(score));
  };

  // Finance calculation function
  const calculateFinancing = () => {
    // Clean the price string to handle formatted prices like "$48,900"
    const priceStr = carPrice.toString().replace(/[$,]/g, '');
    const price = parseFloat(priceStr);
    const down = parseFloat(downPayment.replace(/[$,]/g, '')) || 0;
    const principal = price - down;
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numPayments = parseInt(loanTerm);
    
    console.log('Calculation inputs:', { 
      carPrice: carPrice.toString(), 
      priceStr, 
      price, 
      downPayment, 
      down, 
      principal, 
      monthlyRate, 
      numPayments 
    });
    
    if (principal <= 0) {
      alert('Principal amount must be greater than 0. Please check your down payment.');
      return;
    }
    
    if (monthlyRate <= 0 || numPayments <= 0) {
      alert('Interest rate and loan term must be greater than 0.');
      return;
    }
    
    const monthlyPaymentCalc = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                              (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalPayments = monthlyPaymentCalc * numPayments;
    const totalInterestCalc = totalPayments - principal;
    
    console.log('Calculation results:', { monthlyPaymentCalc, totalInterestCalc });
    
    setMonthlyPayment(monthlyPaymentCalc);
    setTotalInterest(totalInterestCalc);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="h-5 w-5 text-carstore-orange" />
            <h3 className="text-lg font-semibold text-gray-900">Auto Loan Calculator</h3>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Price</label>
            <Input 
              type="text" 
              value={formatPrice(carPrice)}
              className="bg-gray-50" 
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment</label>
            <Input 
              type="number" 
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="5000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: {((parseFloat(carPrice.toString()) * 0.2)).toFixed(0)} (20%)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score Range</label>
            <Select value={creditScore} onValueChange={handleCreditScoreChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="800">Excellent (750+)</SelectItem>
                <SelectItem value="700">Good (700-749)</SelectItem>
                <SelectItem value="650">Fair (650-699)</SelectItem>
                <SelectItem value="600">Poor (600-649)</SelectItem>
                <SelectItem value="550">Bad (Below 600)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (months)</label>
            <Input 
              type="number" 
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              placeholder="60"
              min="6"
              max="120"
            />
            <p className="text-xs text-gray-500 mt-1">
              Common terms: 24, 36, 48, 60, 72 months
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <Input 
              type="number" 
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="6.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Estimated rate based on your credit score
            </p>
          </div>
          
          <Button 
            onClick={calculateFinancing}
            className="w-full bg-carstore-orange text-white hover:bg-carstore-orange-dark py-3 text-lg font-semibold mt-4 mb-4 shadow-lg"
            size="lg"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Calculate EMI
          </Button>
          
          
          {/* Debug info */}
          <div className="mt-2 text-xs text-gray-400 p-2 bg-gray-50 rounded">
            Debug: monthlyPayment = {monthlyPayment}, carPrice = {carPrice}
          </div>
          
          {/* EMI Result - Always show if calculated */}
          {monthlyPayment !== null && (
            <div className="mt-4 border-2 border-carstore-orange rounded-lg">
              <div className="p-6 bg-gradient-to-r from-carstore-orange/10 to-carstore-orange/5 text-center">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly EMI</span>
                </div>
                <div className="text-4xl font-bold text-carstore-orange mb-2">
                  ${monthlyPayment > 0 ? monthlyPayment.toFixed(2) : '0.00'}
                </div>
                <p className="text-sm text-gray-600">
                  per month for {loanTerm} months
                </p>
                {monthlyPayment <= 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    Check your inputs - calculation resulted in $0
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}