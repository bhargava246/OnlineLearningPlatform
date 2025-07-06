import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalcIcon, DollarSign, Percent, Clock } from "lucide-react";

export default function Calculator() {
  const [carPrice, setCarPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [loanTerm, setLoanTerm] = useState("60");
  const [interestRate, setInterestRate] = useState("6.5");
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const calculatePayment = () => {
    const principal = parseFloat(carPrice) - parseFloat(downPayment || "0");
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numPayments = parseInt(loanTerm);

    if (principal > 0 && monthlyRate > 0 && numPayments > 0) {
      const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                     (Math.pow(1 + monthlyRate, numPayments) - 1);
      const totalPaid = payment * numPayments;
      const interest = totalPaid - principal;

      setMonthlyPayment(payment);
      setTotalInterest(interest);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Auto Loan Calculator</h1>
          <p className="text-xl text-gray-600">
            Calculate your monthly car payment and see how different factors affect your loan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalcIcon className="mr-2 h-5 w-5" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="carPrice">Vehicle Price</Label>
                <Input
                  id="carPrice"
                  type="number"
                  placeholder="25000"
                  value={carPrice}
                  onChange={(e) => setCarPrice(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="downPayment">Down Payment</Label>
                <Input
                  id="downPayment"
                  type="number"
                  placeholder="5000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="loanTerm">Loan Term (months)</Label>
                <Select value={loanTerm} onValueChange={setLoanTerm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="36">36 months (3 years)</SelectItem>
                    <SelectItem value="48">48 months (4 years)</SelectItem>
                    <SelectItem value="60">60 months (5 years)</SelectItem>
                    <SelectItem value="72">72 months (6 years)</SelectItem>
                    <SelectItem value="84">84 months (7 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  step="0.1"
                  placeholder="6.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
              </div>

              <Button onClick={calculatePayment} className="w-full">
                Calculate Payment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Monthly Payment</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${monthlyPayment.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <Percent className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Interest</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${totalInterest.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <Clock className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${(monthlyPayment * parseInt(loanTerm || "0")).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {monthlyPayment > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Loan Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Vehicle Price:</span>
                      <span>${parseFloat(carPrice || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Down Payment:</span>
                      <span>${parseFloat(downPayment || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Amount:</span>
                      <span>${(parseFloat(carPrice || "0") - parseFloat(downPayment || "0")).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest Rate:</span>
                      <span>{interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Term:</span>
                      <span>{loanTerm} months</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tips for Getting the Best Auto Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Before You Shop</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Check your credit score</li>
                  <li>• Get pre-approved from multiple lenders</li>
                  <li>• Set a realistic budget</li>
                  <li>• Save for a larger down payment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">When Negotiating</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Focus on the total price, not monthly payment</li>
                  <li>• Compare offers from dealers and banks</li>
                  <li>• Consider shorter loan terms</li>
                  <li>• Read all terms carefully</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}