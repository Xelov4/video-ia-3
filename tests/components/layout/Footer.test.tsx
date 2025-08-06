import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import Footer from '../../../src/components/layout/Footer'

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('displays copyright information', () => {
    render(<Footer />)
    const copyrightText = screen.getByText(/© \d{4}|copyright/i)
    expect(copyrightText).toBeInTheDocument()
  })

  it('displays Video-IA branding', () => {
    render(<Footer />)
    const brandText = screen.getByText(/video-ia/i)
    expect(brandText).toBeInTheDocument()
  })

  it('has footer links', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('has proper semantic structure', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('contains contact or about information', () => {
    render(<Footer />)
    
    // Check for common footer sections
    const aboutSection = screen.queryByText(/à propos|about/i)
    const contactSection = screen.queryByText(/contact/i)
    const legalSection = screen.queryByText(/mentions légales|legal/i)
    
    // At least one of these should be present
    expect([aboutSection, contactSection, legalSection].some(section => section !== null)).toBe(true)
  })

  it('has social media links if present', () => {
    render(<Footer />)
    
    // Check for social media links (optional)
    const socialLinks = screen.queryAllByRole('link')
    socialLinks.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  it('has responsive design classes', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer.className).toMatch(/container|mx-auto|px-|py-|grid|flex/)
  })

  it('displays current year in copyright', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    const yearText = screen.getByText(new RegExp(currentYear.toString()))
    expect(yearText).toBeInTheDocument()
  })
})