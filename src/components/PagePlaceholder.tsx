import React from 'react'
import styled from 'styled-components'

type PagePlaceholderProps = {
  title: string
  description: string
}

const Card = styled.section`
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary || theme.colorBorder};
  background: linear-gradient(
    160deg,
    ${({ theme }) => theme.colorBgContainer} 0%,
    ${({ theme }) => theme.colorBgElevated} 100%
  );
  border-radius: ${({ theme }) => `${theme.borderRadiusLG ?? 16}px`};
  padding: 32px;
  max-width: 860px;
  box-shadow: ${({ theme }) => theme.boxShadowSecondary || theme.boxShadow};

  h2 {
    margin: 0;
    font-size: clamp(1.4rem, 2.4vw, 2rem);
  }

  p {
    margin: 12px 0 0;
    color: ${({ theme }) => theme.colorTextSecondary};
    font-size: ${({ theme }) => `${theme.fontSize + 1}px`};
  }
`

const Hint = styled.div`
  margin-top: 20px;
  border-left: 3px solid ${({ theme }) => theme.colorPrimary};
  padding-left: 12px;
  color: ${({ theme }) => theme.colorText};
  font-size: ${({ theme }) => `${theme.fontSize}px`};
`

const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  title,
  description,
}) => {
  return (
    <Card>
      <h2>{title}</h2>
      <p>{description}</p>
      <Hint>Vista lista para integrar componentes y data real.</Hint>
    </Card>
  )
}

export default PagePlaceholder
