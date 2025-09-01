import headerLogo from '../assets/chef-claude-icon.png'
export default function Header() {
  return (
    <header>
      <img className='header-logo' src={headerLogo} alt="Chef Claude" />
      <h1>The Amazing Chef Claudio</h1>
    </header>
  )
}
