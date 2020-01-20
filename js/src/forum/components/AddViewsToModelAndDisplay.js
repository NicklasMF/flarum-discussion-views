import { extend } from 'flarum/extend';
import Model from 'flarum/Model';
import Discussion from 'flarum/models/Discussion';
import DiscussionListItem from 'flarum/components/DiscussionListItem';
import DiscussionPage from 'flarum/components/DiscussionPage';
import FieldSet from 'flarum/components/FieldSet';
import abbreviateNumber from 'flarum/utils/abbreviateNumber';
import DiscussionView from '../models/DiscussionView';
import avatar from 'flarum/helpers/avatar';
import ItemList from 'flarum/utils/ItemList';
import {ucfirst} from 'flarum/utils/string';
import humanTime from 'flarum/utils/humanTime';

export default function () {
    app.store.models.discussionviews = DiscussionView; //discussionviews = serializer type

    Discussion.prototype.views = Model.hasMany('views');
    Discussion.prototype.canReset = Model.attribute('canReset');

    extend(DiscussionListItem.prototype, 'infoItems', function(items) {
        const views = this.props.discussion.views();

        var number = app.forum.attribute('mb-discussionviews.abbr_numbers') == 1 ? abbreviateNumber(views.length) : views.length;
        items.add('discussion-views', number);
    });

    extend(DiscussionPage.prototype, 'sidebarItems', function(items) {
        if(app.forum.attribute('mb-discussionviews.show_viewlist') == 0) return;
        
        const views = this.discussion.views();
        const viewList = new ItemList();

        $.each(views, function(key, view) {
            if(key == app.forum.attribute('mb-discussionviews.max_listcount')) return false;

            var userName = view.user() === false ? 'Guest' : ucfirst(view.user().username());

            var listitem = 
                <div className="item-lastUser-content">
                    {avatar(view.user() === false ? null : view.user())}
                    <div>
                        {userName}
                        <span className="lastUser-visited" title={view.visitedAt().toLocaleString()}>{humanTime(view.visitedAt())}</span>
                    </div>
                </div>;

            if(view.user() !== false) {
                listitem = <a href={app.forum.attribute('baseUrl') + '/u/' + userName}>{listitem}</a>;
            }

            viewList.add('lastUser-' + key, listitem);
        });

        items.add('lastDiscussionViewers', FieldSet.component({
            label: app.translator.trans('flarum_discussion_views.forum.viewlist.title'),
            className: 'LastDiscussionUsers',
            children: viewList.toArray()
        }));
    });
}
