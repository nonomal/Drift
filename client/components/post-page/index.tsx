import Header from "@components/header/header"
import PageSeo from "@components/page-seo"
import VisibilityBadge from "@components/badges/visibility-badge"
import DocumentComponent from '@components/view-document'
import styles from './post-page.module.css'
import homeStyles from '@styles/Home.module.css'

import type { File, Post } from "@lib/types"
import { Page, Button, Text, Badge, Tooltip, Spacer, ButtonDropdown, ButtonGroup, useMediaQuery } from "@geist-ui/core"
import { useCallback, useEffect, useMemo, useState } from "react"
import { timeAgo, timeUntil } from "@lib/time-ago"
import Archive from '@geist-ui/icons/archive'
import FileDropdown from "@components/file-dropdown"
import ScrollToTop from "@components/scroll-to-top"
import { useRouter } from "next/router"
import ExpirationBadge from "@components/badges/expiration-badge"
import CreatedAgoBadge from "@components/badges/created-ago-badge"
import Cookies from "js-cookie"

type Props = {
    post: Post
}

const PostPage = ({ post }: Props) => {
    const router = useRouter()
    const download = async () => {
        const downloadZip = (await import("client-zip")).downloadZip
        const blob = await downloadZip(post.files.map((file: any) => {
            return {
                name: file.title,
                input: file.content,
                lastModified: new Date(file.updatedAt)
            }
        })).blob()
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `${post.title}.zip`
        link.click()
        link.remove()
    }


    const isMobile = useMediaQuery("mobile")

    const isExpired = useMemo(() => {
        return post.expiresAt && new Date(post.expiresAt) < new Date()
    }, [post.expiresAt])

    const onExpires = useCallback(() => {
        const isOwner = post.users ? post.users[0].id === Cookies.get("drift-userid") : false

        if (isExpired && !isOwner) {
            router.push("/expired")
            return <></>
        }
    }, [isExpired, post.users, router])

    return (
        <Page width={"100%"}>
            <PageSeo
                title={`${post.title} - Drift`}
                description={post.description}
                isPrivate={false}
            />

            <Page.Header>
                <Header />
            </Page.Header>
            <Page.Content className={homeStyles.main}>
                <div className={styles.header}>
                    <span className={styles.title}>
                        <Text h3>{post.title}</Text>
                        <ButtonGroup
                            vertical={isMobile}
                            style={{
                                border: "none",
                                gap: 'var(--gap-half)',
                                marginLeft: isMobile ? "0" : "var(--gap-half)",
                            }}>
                            <VisibilityBadge visibility={post.visibility} />
                            <CreatedAgoBadge createdAt={post.createdAt} />
                            <ExpirationBadge onExpires={onExpires} postExpirationDate={post.expiresAt} />
                        </ButtonGroup>
                    </span>
                    <span className={styles.buttons}>
                        {/* If it hasn't expired, the badge can be too long */}
                        <ButtonGroup vertical={isMobile || (post.expiresAt && !isExpired) ? true : false}>
                            <Button auto onClick={download} icon={<Archive />}>
                                Download as ZIP archive
                            </Button>
                            <FileDropdown files={post.files} />
                        </ButtonGroup>
                    </span>
                </div>
                {/* {post.files.length > 1 && <FileTree files={post.files} />} */}
                {post.files.map(({ id, content, title }: File) => (
                    <DocumentComponent
                        key={id}
                        title={title}
                        initialTab={'preview'}
                        id={id}
                        content={content}
                    />
                ))}
                <ScrollToTop />

            </Page.Content>
        </Page >
    )
}

export default PostPage