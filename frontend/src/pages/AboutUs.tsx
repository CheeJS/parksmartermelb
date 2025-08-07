import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  color: #2C5282;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: #4A5568;
  font-size: 1.2rem;
  line-height: 1.5;
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  color: #2D3748;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  color: #2D3748;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardContent = styled.p`
  color: #4A5568;
  line-height: 1.6;
`;

const ContactForm = styled.form`
  max-width: 600px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2D3748;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2C5282;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
  min-height: 150px;

  &:focus {
    outline: none;
    border-color: #2C5282;
  }
`;

const Button = styled.button`
  background-color: #2C5282;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2B6CB0;
  }
`;

const AboutUs = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <PageContainer>
      <Header>
        <PageTitle>About ParkSmart Melbourne</PageTitle>
        <Subtitle>
          A Crusty Peak Project
        </Subtitle>
        <Subtitle style={{ marginTop: '1rem' }}>
          Transforming Melbourne's parking experience through smart technology and sustainable solutions
        </Subtitle>
      </Header>

      <Section>
        <SectionTitle>About Crusty Peak</SectionTitle>
        <CardContent style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          Crusty Peak is a dynamic team of innovators dedicated to creating smart solutions for urban challenges.
          We combine technical expertise with a deep understanding of city dynamics to develop tools that make
          urban living more sustainable and efficient.
        </CardContent>

        <Grid>
          <Card>
            <CardTitle>
              <span role="img" aria-label="mission">🎯</span> Our Mission
            </CardTitle>
            <CardContent>
              To revolutionize parking in Melbourne by providing real-time data, reducing congestion,
              and promoting sustainable transportation choices that benefit both residents and the environment.
            </CardContent>
          </Card>

          <Card>
            <CardTitle>
              <span role="img" aria-label="vision">👁️</span> Our Vision
            </CardTitle>
            <CardContent>
              A future where finding parking is effortless, environmentally conscious, and contributes to
              Melbourne's status as one of the world's most livable cities.
            </CardContent>
          </Card>

          <Card>
            <CardTitle>
              <span role="img" aria-label="values">💫</span> Our Values
            </CardTitle>
            <CardContent>
              Innovation, sustainability, accessibility, and community-focused solutions drive everything we do
              to make Melbourne's parking system smarter and more efficient.
            </CardContent>
          </Card>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Contact Us</SectionTitle>
        <ContactForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Name</Label>
            <Input type="text" placeholder="Your name" required />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input type="email" placeholder="your@email.com" required />
          </FormGroup>

          <FormGroup>
            <Label>Message</Label>
            <TextArea placeholder="How can we help you?" required />
          </FormGroup>

          <Button type="submit">Send Message</Button>
        </ContactForm>
      </Section>
    </PageContainer>
  );
};

export default AboutUs;