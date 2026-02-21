import { Link } from 'react-router-dom';
import { Card } from '../../components/ui';
import { BookOpen, Shield, FileText, AlertTriangle, Mail, Info } from 'lucide-react';

const PageWrapper = ({ title, icon: Icon, children }) => (
    <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-bg-secondary border border-border-primary flex items-center justify-center">
                <Icon className="w-5 h-5 text-text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        </div>
        <Card>
            <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary leading-relaxed">
                {children}
            </div>
        </Card>
    </div>
);

export const AboutPage = () => (
    <PageWrapper title="About Weeblogs" icon={Info}>
        <p><strong>Weeblogs.in</strong> is India's curated blog platform for literature, lifestyle, perspectives, academics, and creative non-fiction.</p>
        <p>We bring together readers and writers from across the country to share ideas, stories, and knowledge. Our editorial team reviews every submission to ensure quality and relevance.</p>
        <h3>Our Mission</h3>
        <p>To democratize quality content creation and build a community of thoughtful writers and engaged readers.</p>
        <h3>How It Works</h3>
        <ul>
            <li><strong>Readers</strong> can browse, search, and read content across curated sections and subsections.</li>
            <li><strong>Writers</strong> can submit blogs through our rich editor — each submission goes through admin review.</li>
            <li><strong>Premium Content</strong> is rated by our editors; high-quality posts are made available through affordable subscription plans.</li>
        </ul>
    </PageWrapper>
);

export const ContactPage = () => (
    <PageWrapper title="Contact Us" icon={Mail}>
        <p>We'd love to hear from you. Whether you have a question, suggestion, or need support, reach out to us:</p>
        <ul>
            <li><strong>Email:</strong> support@weeblogs.in</li>
            <li><strong>Business Inquiries:</strong> business@weeblogs.in</li>
            <li><strong>Content Submission Issues:</strong> editors@weeblogs.in</li>
        </ul>
        <p>We aim to respond to all inquiries within 48 hours.</p>
    </PageWrapper>
);

export const PrivacyPolicyPage = () => (
    <PageWrapper title="Privacy Policy" icon={Shield}>
        <p><em>Last updated: February 2026</em></p>
        <h3>Information We Collect</h3>
        <p>We collect your email address and name during registration. Payment information is processed securely through Razorpay and is never stored on our servers.</p>
        <h3>How We Use Your Information</h3>
        <ul>
            <li>To provide access to our platform and content.</li>
            <li>To process payments and manage subscriptions.</li>
            <li>To send important updates and newsletters (with your consent).</li>
        </ul>
        <h3>Data Security</h3>
        <p>We use industry-standard encryption and security measures to protect your data. Your passwords are hashed and never stored in plain text.</p>
        <h3>Your Rights</h3>
        <p>You can request deletion of your account and data by contacting us at support@weeblogs.in.</p>
    </PageWrapper>
);

export const CopyrightPolicyPage = () => (
    <PageWrapper title="Copyright Policy" icon={FileText}>
        <p><em>Last updated: February 2026</em></p>
        <div className="bg-bg-secondary border border-border-primary rounded-lg p-4 my-4">
            <p className="text-text-primary font-medium mb-2">⚠️ Important Notice</p>
            <p className="text-text-secondary text-sm">All content published on Weeblogs.in is protected by copyright law. Unauthorized reproduction, distribution, or sale of content is strictly prohibited.</p>
        </div>
        <h3>Content Ownership</h3>
        <p>Authors retain copyright of their original works. By publishing on Weeblogs.in, authors grant us a non-exclusive license to display and distribute their content on our platform.</p>
        <h3>Subscriber Rights</h3>
        <ul>
            <li>Subscription grants <strong>read-only access</strong> to content.</li>
            <li>It does <strong>not</strong> transfer reproduction or resale rights.</li>
            <li>Screenshots, copying, or redistribution of premium content is prohibited.</li>
        </ul>
        <h3>Enforcement</h3>
        <p>Violations may lead to immediate account termination and legal action under applicable copyright laws.</p>
    </PageWrapper>
);

export const TermsOfUsePage = () => (
    <PageWrapper title="Terms of Use" icon={FileText}>
        <p><em>Last updated: February 2026</em></p>
        <h3>Acceptance of Terms</h3>
        <p>By accessing and using Weeblogs.in, you agree to be bound by these Terms of Use.</p>
        <h3>User Accounts</h3>
        <ul>
            <li>You must provide accurate information during registration.</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>One person may not maintain more than one account.</li>
        </ul>
        <h3>Content Submissions</h3>
        <ul>
            <li>All blog submissions are subject to editorial review.</li>
            <li>We reserve the right to reject or remove content that violates our guidelines.</li>
            <li>Plagiarized content will result in immediate account suspension.</li>
        </ul>
        <h3>Payments & Refunds</h3>
        <ul>
            <li>All payments are processed through Razorpay.</li>
            <li>Subscription charges are non-refundable once the access period has started.</li>
            <li>Single blog purchases are non-refundable.</li>
        </ul>
        <h3>Prohibited Activities</h3>
        <p>You may not: scrape content, share login credentials, redistribute premium content, or use automated tools to access the platform.</p>
    </PageWrapper>
);

export const ReportInfringementPage = () => (
    <PageWrapper title="Report Infringement" icon={AlertTriangle}>
        <p>If you believe that content on Weeblogs.in infringes your copyright or other intellectual property rights, please contact us with the following information:</p>
        <ol>
            <li>Your full legal name and contact information.</li>
            <li>A description of the copyrighted work you believe has been infringed.</li>
            <li>The URL(s) of the infringing content on our platform.</li>
            <li>A statement that you have a good faith belief that the use is unauthorized.</li>
            <li>Your physical or electronic signature.</li>
        </ol>
        <h3>Where to Send</h3>
        <p>Email your takedown request to: <strong>legal@weeblogs.in</strong></p>
        <p>We will review and respond to all valid notices within 7 business days.</p>
        <div className="bg-bg-secondary border border-border-primary rounded-lg p-4 my-4">
            <p className="text-text-secondary text-sm">If you are a content creator on our platform and believe your work is being redistributed elsewhere, we can assist you with documentation for takedown requests on other platforms.</p>
        </div>
    </PageWrapper>
);
