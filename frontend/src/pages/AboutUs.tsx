import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #2C5282 0%, #48BB78 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/KrustyPeakLogo.png') no-repeat center;
    background-size: 150px;
    opacity: 0.1;
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.4rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Logo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
`;

const ContentSection = styled.section`
  padding: 1rem 0;
  background: white;
`;

const SectionTitle = styled.h2`
  color: #2D3748;
  margin-bottom: 1rem;
  font-size: 2.5rem;
  text-align: center;
  font-weight: 700;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 1.5rem;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2C5282, #48BB78);
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }
`;

const CardIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const CardTitle = styled.h3`
  color: #2D3748;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
  font-weight: 600;
`;

const CardContent = styled.p`
  color: #4A5568;
  line-height: 1.8;
  text-align: center;
  font-size: 1.1rem;
`;

const ContactSection = styled.section`
  background: white;
  padding: 0.5rem 0;
`;

const AboutUs = () => {

  return (
    <PageContainer>
      <HeroSection>
        <Container>
          <LogoContainer>
            <Logo src="/KrustyPeakLogo.png" alt="Krusty Peak Logo" />
          </LogoContainer>
          <HeroTitle>Krusty Peak</HeroTitle>
          <HeroSubtitle>
            Driving smarter, greener parking solutions for Melbourne’s future
          </HeroSubtitle>
        </Container>
      </HeroSection>

      <ContentSection>
        <Container>
          <SectionTitle>About Our Mission</SectionTitle>
          <Grid>
            <Card>
              <CardIcon>🎯</CardIcon>
              <CardTitle>Our Mission</CardTitle>
              <CardContent>
                To revolutionize Melbourne's parking ecosystem by providing real-time data, intelligent recommendations, 
                and eco-friendly solutions that reduce congestion and promote sustainable urban mobility.
              </CardContent>
            </Card>

            <Card>
              <CardIcon>🌟</CardIcon>
              <CardTitle>Our Vision</CardTitle>
              <CardContent>
                A future where finding parking is effortless, environmentally conscious, and seamlessly integrated 
                with public transport to enhance Melbourne's livability for everyone.
              </CardContent>
            </Card>

            <Card>
              <CardIcon>💡</CardIcon>
              <CardTitle>Our Innovation</CardTitle>
              <CardContent>
                Using real-world data to create intelligent parking solutions that 
                benefit drivers, the environment, and the broader Melbourne community.
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </ContentSection>

      <ContactSection>
        <Container>
          <SectionTitle>Get In Touch</SectionTitle>
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <p style={{ 
              fontSize: '1.3rem', 
              color: '#4A5568',
              lineHeight: '1.8',
              marginBottom: '3rem',
              fontWeight: '400'
            }}>
              Have questions about our parking solutions? Want to share feedback or explore partnership opportunities? 
              We'd love to hear from you!
            </p>
            
            <div style={{
              background: 'linear-gradient(135deg, #F0FFF4 0%, #E6FFFA 100%)',
              padding: '4rem 3rem',
              borderRadius: '2rem',
              border: '1px solid #C6F6D5',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative background elements */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(44, 82, 130, 0.1))',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '150px',
                height: '150px',
                background: 'linear-gradient(135deg, rgba(44, 82, 130, 0.1), rgba(72, 187, 120, 0.1))',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1.5rem'
                }}>
                  📧
                </div>
                
                <h3 style={{ 
                  color: '#2F855A',
                  fontSize: '2rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  letterSpacing: '-0.02em'
                }}>
                  Contact Us
                </h3>
                
                <p style={{
                  color: '#2F855A',
                  fontSize: '1.1rem',
                  marginBottom: '2rem',
                  opacity: 0.8
                }}>
                  Drop us a line and we'll get back to you as soon as possible
                </p>
                
                <div style={{
                  marginBottom: '2.5rem'
                }}>
                  <a 
                    href="mailto:krustypeak@gmail.com" 
                    style={{ 
                      color: '#2C5282', 
                      textDecoration: 'none',
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem 2rem',
                      borderRadius: '1rem',
                      background: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(44, 82, 130, 0.2)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(72, 187, 120, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(44, 82, 130, 0.2)';
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>✉️</span>
                    krustypeak@gmail.com
                  </a>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    textAlign: 'center',
                    color: '#2F855A'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Quick Response</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    color: '#2F855A'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤝</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Partnership Ready</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    color: '#2F855A'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💡</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Open to Ideas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </ContactSection>
    </PageContainer>
  );
};

export default AboutUs;