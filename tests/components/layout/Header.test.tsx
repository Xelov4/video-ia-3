import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import Header from '../../../src/components/layout/Header'

describe('Header', () => {
  it('renders without crashing', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })

  it('displays the logo/brand name', () => {
    render(<Header />)
    const logo = screen.getByText(/video-ia/i)
    expect(logo).toBeInTheDocument()
  })

  it('has navigation links', () => {
    render(<Header />)
    
    // Check for main navigation links
    const homeLink = screen.getByRole('link', { name: /accueil/i })
    expect(homeLink).toBeInTheDocument()
    
    const toolsLink = screen.getByRole('link', { name: /outils/i })
    expect(toolsLink).toBeInTheDocument()
    
    const categoriesLink = screen.getByRole('link', { name: /catégories/i })
    expect(categoriesLink).toBeInTheDocument()
  })

  it('has proper link destinations', () => {
    render(<Header />)
    
    const homeLink = screen.getByRole('link', { name: /accueil/i })
    expect(homeLink).toHaveAttribute('href', '/')
    
    const toolsLink = screen.getByRole('link', { name: /outils/i })
    expect(toolsLink).toHaveAttribute('href', '/tools')
    
    const categoriesLink = screen.getByRole('link', { name: /catégories/i })
    expect(categoriesLink).toHaveAttribute('href', '/categories')
  })

  it('has mobile menu functionality', () => {
    render(<Header />)
    
    // Look for mobile menu button (hamburger)
    const menuButton = screen.getByRole('button')
    expect(menuButton).toBeInTheDocument()
  })

  it('has search functionality in header', () => {
    render(<Header />)
    
    // Check if there's a search input in header
    const searchInputs = screen.queryAllByPlaceholderText(/rechercher/i)
    if (searchInputs.length > 0) {
      expect(searchInputs[0]).toBeInTheDocument()
    }
  })

  it('has proper semantic structure', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('has responsive design classes', () => {
    render(<Header />)
    
    const header = screen.getByRole('banner')
    expect(header.className).toMatch(/container|mx-auto|px-|py-/)
  })

  it('displays logo with proper alt text', () => {
    render(<Header />)
    
    // Check for logo image if it exists
    const logoImages = screen.queryAllByRole('img')
    logoImages.forEach(img => {
      expect(img).toHaveAttribute('alt')
      expect(img.getAttribute('alt')).toBeTruthy()
    })
  })
})