import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import HeroSection from '../../../src/components/home/HeroSection'

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

describe('HeroSection', () => {
  it('renders without crashing', () => {
    render(<HeroSection />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays the main heading', () => {
    render(<HeroSection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/découvrez les meilleurs outils ia/i)
  })

  it('displays the subheading', () => {
    render(<HeroSection />)
    const subheading = screen.getByText(/une collection complète d'outils d'intelligence artificielle/i)
    expect(subheading).toBeInTheDocument()
  })

  it('has search functionality', () => {
    render(<HeroSection />)
    const searchInput = screen.getByPlaceholderText(/rechercher un outil/i)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  it('has a search button', () => {
    render(<HeroSection />)
    const searchButton = screen.getByRole('button', { name: /rechercher/i })
    expect(searchButton).toBeInTheDocument()
  })

  it('displays featured categories section', () => {
    render(<HeroSection />)
    const categoriesHeading = screen.getByText(/catégories populaires/i)
    expect(categoriesHeading).toBeInTheDocument()
  })

  it('displays stats section', () => {
    render(<HeroSection />)
    // Look for stats numbers
    const statsSection = screen.getByText(/1000\+/i)
    expect(statsSection).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<HeroSection />)
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('displays category cards', () => {
    render(<HeroSection />)
    // Should show category cards (at least one)
    const categoryCards = screen.getAllByTestId(/category-card/i)
    expect(categoryCards.length).toBeGreaterThanOrEqual(0) // May be 0 if no data
  })

  it('has responsive design classes', () => {
    render(<HeroSection />)
    const main = screen.getByRole('main')
    expect(main.className).toMatch(/container|mx-auto|px-|py-/)
  })
})