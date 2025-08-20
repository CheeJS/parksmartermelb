import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { searchPlaces, getPlaceDetails, PlacePrediction, PlaceDetails } from '../services/secureGoogleMapsService';

const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
  height: 48px; /* Fixed height for consistency */
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #48BB78;
    box-shadow: 0 0 0 1px #48BB78;
  }
`;

const SuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin: 0;
  padding: 0;
  list-style: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SuggestionItem = styled.li<{ isHighlighted: boolean }>`
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #F7FAFC;
  background-color: ${props => props.isHighlighted ? '#F0FFF4' : 'white'};
  transition: background-color 0.15s ease;
  
  &:hover {
    background-color: #F0FFF4;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MainText = styled.div`
  font-weight: 500;
  color: #2D3748;
`;

const SecondaryText = styled.div`
  font-size: 0.875rem;
  color: #4A5568;
  margin-top: 0.25rem;
`;

const LoadingMessage = styled.div`
  padding: 0.75rem;
  color: #4A5568;
  font-style: italic;
`;

interface SecureAutocompleteProps {
  placeholder?: string;
  onPlaceSelected: (place: PlaceDetails) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export const SecureAutocomplete: React.FC<SecureAutocompleteProps> = ({
  placeholder = "Search for a place...",
  onPlaceSelected,
  value = "",
  onChange
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);
    
    if (onChange) {
      onChange(newValue);
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (newValue.length >= 3) {
      setIsLoading(true);
      setShowSuggestions(true);
      setErrorMessage(null);
      
      // Debounce search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
      console.debug('🔍 Autocomplete querying backend for:', newValue);
      const results = await searchPlaces(newValue);
      console.debug('✅ Autocomplete predictions:', results);
      setPredictions(results);
        } catch (error) {
          console.error('Search error:', error);
          setPredictions([]);
      setErrorMessage((error as any)?.message || 'Search failed');
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setPredictions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    setErrorMessage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectPrediction(predictions[highlightedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectPrediction = async (prediction: PlacePrediction) => {
    try {
      setIsLoading(true);
      const placeDetails = await getPlaceDetails(prediction.place_id);
      
      setInputValue(prediction.description);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      
      onPlaceSelected(placeDetails);
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AutocompleteContainer ref={containerRef}>
      <SearchInput
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (predictions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
      />
      
      {showSuggestions && (
        <SuggestionsList>
          {isLoading ? (
            <LoadingMessage>Searching...</LoadingMessage>
          ) : errorMessage ? (
            <LoadingMessage style={{ color: '#E53E3E' }}>⚠️ {errorMessage}</LoadingMessage>
          ) : predictions.length > 0 ? (
            predictions.map((prediction, index) => (
              <SuggestionItem
                key={prediction.place_id}
                isHighlighted={index === highlightedIndex}
                onClick={() => handleSelectPrediction(prediction)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <MainText>{prediction.main_text || prediction.description}</MainText>
                {prediction.secondary_text && (
                  <SecondaryText>{prediction.secondary_text}</SecondaryText>
                )}
              </SuggestionItem>
            ))
          ) : (
            <LoadingMessage>No places found</LoadingMessage>
          )}
        </SuggestionsList>
      )}
    </AutocompleteContainer>
  );
};
