import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #2C5282 0%, #48BB78 100%);
  color: white;
  padding: 6rem 2rem;
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

const Section = styled.section`
  padding: 4rem 0;
`;

const SectionTitle = styled.h2`
  color: #2D3748;
  margin-bottom: 3rem;
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

const TeamSection = styled.section`
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
  padding: 5rem 0;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h4`
  color: #2D3748;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
`;

const FeatureText = styled.p`
  color: #4A5568;
  line-height: 1.6;
`;

const ContactSection = styled.section`
  background: white;
  padding: 0.1rem 0;
`;

const ContactForm = styled.form`
  max-width: 700px;
  margin: 0 auto;
  background: white;
  padding: 3rem;
  border-radius: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  color: #2D3748;
  font-weight: 600;
  font-size: 1.1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 0.75rem;
  font-size: 1rem;
  min-height: 150px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #2C5282 0%, #48BB78 100%);
  color: white;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(44, 82, 130, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AboutUs = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  return (
    <PageContainer>
      <HeroSection>
        <Container>
          <LogoContainer>
            <Logo src="/KrustyPeakLogo.png" alt="Krusty Peak Logo" />
          </LogoContainer>
          <HeroTitle>Krusty Peak</HeroTitle>
          <HeroSubtitle>
            Innovating Melbourne's parking experience through smart technology and sustainable solutions
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
                Combining cutting-edge technology with real-world data to create intelligent parking solutions that 
                benefit drivers, the environment, and the broader Melbourne community.
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </ContentSection>

      <ContactSection>
        <Container>
          <SectionTitle>Get In Touch</SectionTitle>
          <ContactForm onSubmit={handleSubmit}>
            <FormGrid>
              <FormGroup>
                <Label>Full Name</Label>
                <Input type="text" placeholder="Enter your full name" required />
              </FormGroup>

              <FormGroup>
                <Label>Email Address</Label>
                <Input type="email" placeholder="your.email@example.com" required />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label>Subject</Label>
              <Input type="text" placeholder="What's this about?" required />
            </FormGroup>

            <FormGroup>
              <Label>Message</Label>
              <TextArea placeholder="Tell us more about your inquiry, feedback, or how we can help you..." required />
            </FormGroup>

            <Button type="submit">Send Message</Button>
          </ContactForm>
        </Container>
      </ContactSection>
    </PageContainer>
  );
};

export default AboutUs;