import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Car } from "@/../../shared/schema";
import carImagePath from "@assets/WhatsApp Image 2025-07-03 at 12.35.56_e243c439_1751526411605.jpg";

export default function Hero() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch all cars for generating suggestions
  const { data: cars = [] } = useQuery<Car[]>({
    queryKey: ['/api/cars'],
    enabled: true,
  });

  // Generate suggestions based on search term
  const generateSuggestions = (term: string): string[] => {
    if (!term.trim() || term.length < 2) return [];
    
    const termLower = term.toLowerCase();
    const suggestions = new Set<string>();
    
    cars.forEach(car => {
      // Add make suggestions
      if (car.make.toLowerCase().includes(termLower)) {
        suggestions.add(car.make);
      }
      
      // Add model suggestions
      if (car.model.toLowerCase().includes(termLower)) {
        suggestions.add(`${car.make} ${car.model}`);
      }
      
      // Add year suggestions
      if (car.year.toString().includes(term)) {
        suggestions.add(`${car.year} ${car.make} ${car.model}`);
      }
      
      // Add body type suggestions
      if (car.bodyType.toLowerCase().includes(termLower)) {
        suggestions.add(car.bodyType);
      }
      
      // Add fuel type suggestions
      if (car.fuelType.toLowerCase().includes(termLower)) {
        suggestions.add(car.fuelType);
      }
    });
    
    return Array.from(suggestions).slice(0, 6); // Limit to 6 suggestions
  };

  const suggestions = generateSuggestions(searchTerm);

  const handleSearch = (searchValue?: string) => {
    const valueToSearch = searchValue || searchTerm;
    if (valueToSearch.trim()) {
      setLocation(`/search?q=${encodeURIComponent(valueToSearch)}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        handleSearch(suggestions[selectedSuggestionIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const handleSearchButtonClick = () => {
    handleSearch();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white min-h-[80vh] overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      
      {/* Car image */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-0">
        <img 
          src={carImagePath} 
          alt="Luxury Orange Sports Car" 
          className="h-[500px] w-auto object-contain opacity-90"
        />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Get your dream<br />
            <span className="text-white">Car</span>
          </h1>
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-sm text-gray-300">New Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1L+</div>
              <div className="text-sm text-gray-300">Customers</div>
            </div>
          </div>
          
          {/* Search bar */}
          <div ref={searchRef} className="relative bg-white rounded-lg p-2 max-w-md mb-8">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="What are you looking for?"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="border-0 bg-transparent text-gray-900 placeholder-gray-500 focus:ring-0 flex-1"
              />
              <button
                onClick={handleSearchButtonClick}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-md transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      index === selectedSuggestionIndex
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
    </section>
  );
}