export interface BasicBreadcrumbsProps {
    current: string;
    previous?: BreadcrumbProps[];
}

export type BreadcrumbProps = {
    text: string;
    url: string;
}